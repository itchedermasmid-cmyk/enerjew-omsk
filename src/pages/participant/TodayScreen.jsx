import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getOmskDate, isMitzvahEligibleOnDate, calculateMissionProgress, getProgressLevel, getProgressLevelName, MILESTONE_THRESHOLDS } from '@/lib/campaign';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import RetrospectivePanel from '@/components/participant/RetrospectivePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Flame, Target, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MITZVAH_ICONS = {
  'Тфилин': '🤲', 'Шаббатние свечи': '🕯️', 'Модэ Ани утром': '🌅',
  'Омовение рук утром': '💧', 'Утренний Шма': '📖', 'Ночной Шма': '🌙',
  'Давенинг / молитва': '🙏', 'Изучение Торы': '📜', 'Браха перед едой': '🍞'
};

export default function TodayScreen() {
  const { participant, refresh } = useParticipant();
  const [mitzvah, setMitzvah] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [isEligibleToday, setIsEligibleToday] = useState(true);

  const today = getOmskDate();

  const loadData = useCallback(async () => {
    if (!participant?.main_mitzvah_id) return;
    
    const [mitzvahs, checkIns] = await Promise.all([
      base44.entities.Mitzvah.filter({ id: participant.main_mitzvah_id }),
      base44.entities.MainCheckIn.filter({ 
        participant_id: participant.id, 
        eligible_date: today,
        is_valid: true 
      })
    ]);
    
    if (mitzvahs.length > 0) {
      setMitzvah(mitzvahs[0]);
      setIsEligibleToday(isMitzvahEligibleOnDate(mitzvahs[0], today));
    }
    setCheckedIn(checkIns.length > 0);
    setLoading(false);
  }, [participant, today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckIn = async () => {
    if (checkedIn || submitting || !isEligibleToday) return;
    setSubmitting(true);
    
    await base44.entities.MainCheckIn.create({
      participant_id: participant.id,
      mitzvah_id: participant.main_mitzvah_id,
      eligible_date: today,
      is_retrospective: false,
      source: 'participant'
    });

    // Recalculate stats
    const allCheckIns = await base44.entities.MainCheckIn.filter({
      participant_id: participant.id, is_valid: true
    });
    
    const settings = await base44.entities.CampaignSettings.filter({ key: 'campaign_start' });
    const startDate = settings.length > 0 ? settings[0].value : '2025-06-07';
    const endSettings = await base44.entities.CampaignSettings.filter({ key: 'campaign_end' });
    const endDate = endSettings.length > 0 ? endSettings[0].value : '2025-08-31';
    
    // Count eligible days up to today
    let eligibleCount = 0;
    const current = new Date(startDate);
    const todayDate = new Date(today);
    const endD = new Date(endDate);
    const checkDate = todayDate < endD ? todayDate : endD;
    
    while (current <= checkDate) {
      const dateStr = current.toISOString().split('T')[0];
      if (mitzvah && isMitzvahEligibleOnDate(mitzvah, dateStr)) {
        eligibleCount++;
      }
      current.setDate(current.getDate() + 1);
    }

    const completed = allCheckIns.length + 1;
    const progress = calculateMissionProgress(completed, eligibleCount);
    const level = getProgressLevel(progress);
    
    // Calculate streak
    let streak = 1;
    const sortedCheckIns = [...allCheckIns, { eligible_date: today }]
      .sort((a, b) => b.eligible_date.localeCompare(a.eligible_date));
    
    // Simple streak: count consecutive eligible days with check-ins
    for (let i = 1; i < sortedCheckIns.length; i++) {
      const prevDate = new Date(sortedCheckIns[i - 1].eligible_date);
      const currDate = new Date(sortedCheckIns[i].eligible_date);
      const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      if (diff <= 2) { // Allow 1 day gap for non-eligible days
        streak++;
      } else break;
    }

    const bestStreak = Math.max(streak, participant.best_streak || 0);
    
    // Check special prize
    const specialPrize = progress >= 80 && (participant.bonus_stars || 0) >= 100;

    await base44.entities.Participant.update(participant.id, {
      completed_eligible: completed,
      eligible_so_far: eligibleCount,
      mission_progress: progress,
      progress_level: level,
      current_streak: streak,
      best_streak: bestStreak,
      special_prize_earned: specialPrize
    });

    setCheckedIn(true);
    setSubmitting(false);
    setCelebrated(true);
    
    // Celebration
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    await refresh();
    setTimeout(() => setCelebrated(false), 3000);
  };

  const progress = participant?.mission_progress || 0;
  const nextMilestone = progress < 25 ? 25 : progress < 50 ? 50 : progress < 80 ? 80 : 100;
  const displayName = participant?.nickname || participant?.full_name?.split(' ')[0] || '';

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Сегодня" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-2xl font-display font-bold">
            Привет, {displayName}! 👋
          </p>
          <p className="text-muted-foreground">
            {new Date(today).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        {/* Main Mitzvah Card */}
        {mitzvah && (
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MITZVAH_ICONS[mitzvah.name_ru] || '✡️'}</span>
                <div>
                  <p className="text-sm opacity-90">Моя миссия</p>
                  <p className="text-lg font-bold">{mitzvah.name_ru}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Flame className="w-4 h-4" />
                    <span className="text-xl font-bold">{participant?.current_streak || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">серия дней</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Target className="w-4 h-4" />
                    <span className="text-xl font-bold">{progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">прогресс</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-secondary">
                    <Star className="w-4 h-4" />
                    <span className="text-xl font-bold">{participant?.bonus_stars || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">бонусы</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">До {nextMilestone}%</span>
                  <span className="font-medium text-primary">{progress}%</span>
                </div>
                <Progress value={progress} max={nextMilestone} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {getProgressLevelName(participant?.progress_level || 'beginner')}
                </p>
              </div>

              {/* Check-in button */}
              {!isEligibleToday ? (
                <div className="text-center py-3 bg-muted rounded-xl">
                  <p className="text-muted-foreground">
                    Сегодня не день для этой мицвы
                  </p>
                </div>
              ) : loading ? (
                <div className="h-14 bg-muted rounded-xl animate-pulse" />
              ) : (
                <AnimatePresence mode="wait">
                  {checkedIn ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex items-center justify-center gap-3 py-4 rounded-xl ${
                        celebrated ? 'bg-success/20' : 'bg-success/10'
                      }`}
                    >
                      <Check className="w-6 h-6 text-success" />
                      <span className="font-semibold text-success">
                        {celebrated ? 'Отлично! Так держать! 🎉' : 'Выполнено сегодня ✓'}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Button
                        size="lg"
                        onClick={handleCheckIn}
                        disabled={submitting}
                        className="w-full h-14 text-base font-semibold rounded-xl shadow-lg"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Я выполнил(а) свою сегодняшнюю мицву
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        )}

        {/* Retrospective panel */}
        <RetrospectivePanel />
      </div>
      
      <BottomNav />
    </div>
  );
}