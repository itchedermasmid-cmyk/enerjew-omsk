import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { formatDateRu, getOmskDate, isMitzvahEligibleOnDate, getProgressLevelName } from '@/lib/campaign';
import { getMitzvahIcon, getMitzvahMeta } from '@/lib/mitzvahCatalog';
import { getCampaignSetting, recalculateParticipantStats } from '@/lib/participantStats';
import { assertParticipantActionsOpen } from '@/lib/participantActions';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import RetrospectivePanel from '@/components/participant/RetrospectivePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Flame, Target, Star, Sparkles, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function TodayScreen() {
  const { participant, refresh } = useParticipant();
  const [mitzvah, setMitzvah] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [isEligibleToday, setIsEligibleToday] = useState(true);
  const [campaignOpen, setCampaignOpen] = useState(true);
  const [campaignStart, setCampaignStart] = useState('');

  const today = getOmskDate();

  const loadData = useCallback(async () => {
    if (!participant?.main_mitzvah_id) {
      setLoading(false);
      return;
    }
    
    const [mitzvahs, checkIns, startDate, endDate] = await Promise.all([
      base44.entities.Mitzvah.filter({ id: participant.main_mitzvah_id }),
      base44.entities.MainCheckIn.filter({ 
        participant_id: participant.id, 
        eligible_date: today,
        is_valid: true 
      }),
      getCampaignSetting('campaign_start'),
      getCampaignSetting('campaign_end'),
    ]);
    
    const isOpen = today >= startDate && today <= endDate;
    setCampaignOpen(isOpen);
    setCampaignStart(startDate);
    if (mitzvahs.length > 0) {
      setMitzvah(mitzvahs[0]);
      setIsEligibleToday(isOpen && isMitzvahEligibleOnDate(mitzvahs[0], today));
    }
    setCheckedIn(checkIns.length > 0);
    setLoading(false);
  }, [participant, today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckIn = async () => {
    if (checkedIn || submitting || !isEligibleToday) return;
    setSubmitting(true);

    try {
      await assertParticipantActionsOpen(today);
      const existing = await base44.entities.MainCheckIn.filter({
        participant_id: participant.id,
        mitzvah_id: participant.main_mitzvah_id,
        eligible_date: today,
        is_valid: true,
      });

      if (existing.length === 0) {
        await base44.entities.MainCheckIn.create({
          participant_id: participant.id,
          mitzvah_id: participant.main_mitzvah_id,
          eligible_date: today,
          is_retrospective: false,
          source: 'participant',
        });
      }

      await recalculateParticipantStats(participant, mitzvah);
      setCheckedIn(true);
      setCelebrated(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      await refresh();
      setTimeout(() => setCelebrated(false), 3000);
    } catch {
      toast.error('Не удалось сохранить отметку. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = participant?.mission_progress || 0;
  const nextMilestone = progress < 25 ? 25 : progress < 50 ? 50 : progress < 80 ? 80 : 100;
  const displayName = participant?.nickname || participant?.full_name?.split(' ')[0] || '';
  const resourceSlug = mitzvah ? getMitzvahMeta(mitzvah).slug : '';

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
                <span className="text-3xl">{getMitzvahIcon(mitzvah)}</span>
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
                <Progress value={Math.min(100, (progress / nextMilestone) * 100)} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {getProgressLevelName(participant?.progress_level || 'beginner')}
                </p>
              </div>

              {/* Check-in button */}
              {!campaignOpen ? (
                <div className="text-center py-3 bg-muted rounded-xl">
                  <p className="text-muted-foreground">
                    {today < campaignStart ? `Кампания начнётся ${formatDateRu(campaignStart)}` : 'Летняя кампания завершена'}
                  </p>
                </div>
              ) : !isEligibleToday ? (
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
                        {celebrated ? `Отлично! ${mitzvah.name_ru} — выполнено! 🎉` : `Сегодня выполнено: ${mitzvah.name_ru} ✓`}
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
                            Я выполнил(а): {mitzvah.name_ru}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              <Button asChild variant="ghost" className="w-full mt-2 text-primary">
                <Link to={`/resources?resource=${resourceSlug}`}>
                  <BookMarked className="w-4 h-4 mr-2" />
                  Как выполнить эту мицву
                </Link>
              </Button>
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
