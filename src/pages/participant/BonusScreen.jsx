import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { formatDateRu, getOmskDate, isMitzvahEligibleOnDate, isMitzvahEligibleForGender } from '@/lib/campaign';
import { getMitzvahIcon } from '@/lib/mitzvahCatalog';
import { getCampaignSetting, recalculateParticipantStats } from '@/lib/participantStats';
import { assertParticipantActionsOpen } from '@/lib/participantActions';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function BonusScreen() {
  const { participant, refresh } = useParticipant();
  const [mitzvahs, setMitzvahs] = useState([]);
  const [todayBonuses, setTodayBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [maxDaily, setMaxDaily] = useState(3);
  const [campaignOpen, setCampaignOpen] = useState(true);
  const [campaignStart, setCampaignStart] = useState('');
  const today = getOmskDate();

  const loadData = useCallback(async () => {
    if (!participant) return;
    
    const [allMitzvahs, bonuses, maxDailySetting, startDate, endDate] = await Promise.all([
      base44.entities.Mitzvah.filter({ is_active: true, can_be_bonus: true }),
      base44.entities.BonusCheckIn.filter({ 
        participant_id: participant.id, 
        eligible_date: today,
        is_valid: true 
      }),
      getCampaignSetting('max_daily_bonus'),
      getCampaignSetting('campaign_start'),
      getCampaignSetting('campaign_end'),
    ]);

    const isOpen = today >= startDate && today <= endDate;
    // Filter: eligible for gender, eligible today, not the main mitzvah
    const eligible = allMitzvahs
      .filter(m => m.id !== participant.main_mitzvah_id)
      .filter(m => isMitzvahEligibleForGender(m, participant.gender))
      .filter(m => isMitzvahEligibleOnDate(m, today))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    setMitzvahs(isOpen ? eligible : []);
    setTodayBonuses(bonuses);
    setMaxDaily(Number(maxDailySetting) || 3);
    setCampaignOpen(isOpen);
    setCampaignStart(startDate);
    setLoading(false);
  }, [participant, today]);

  useEffect(() => { loadData(); }, [loadData]);

  const todayBonusCount = todayBonuses.length;
  const completedIds = new Set(todayBonuses.map(b => b.mitzvah_id));
  const limitReached = todayBonusCount >= maxDaily;

  const handleBonus = async (mitzvahId) => {
    if (completedIds.has(mitzvahId) || limitReached || submitting) return;
    setSubmitting(mitzvahId);
    
    try {
      await assertParticipantActionsOpen(today);
      const existing = await base44.entities.BonusCheckIn.filter({
        participant_id: participant.id,
        mitzvah_id: mitzvahId,
        eligible_date: today,
        is_valid: true,
      });

      if (existing.length === 0) {
        await base44.entities.BonusCheckIn.create({
          participant_id: participant.id,
          mitzvah_id: mitzvahId,
          eligible_date: today,
          stars_awarded: 1,
          source: 'participant',
        });

        await recalculateParticipantStats(participant);
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
        await refresh();
      }
      await loadData();
    } catch {
      toast.error('Не удалось сохранить бонус. Попробуйте ещё раз.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Бонусные звёзды" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Stars counter */}
        <div className="flex items-center justify-between bg-gradient-to-r from-secondary/20 to-secondary/5 rounded-2xl p-4">
          <div>
            <p className="text-sm text-muted-foreground">Бонусные звёзды</p>
            <p className="text-3xl font-bold text-secondary">{participant?.bonus_stars || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Сегодня</p>
            <p className="text-lg font-semibold">
              {todayBonusCount}/{maxDaily}
            </p>
          </div>
        </div>

        {!campaignOpen && (
          <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {today < campaignStart ? `Бонусные отметки откроются ${formatDateRu(campaignStart)}` : 'Летняя кампания завершена'}
            </p>
          </div>
        )}

        {campaignOpen && limitReached && (
          <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Лимит бонусов на сегодня достигнут
            </p>
          </div>
        )}

        {/* Mitzvah cards */}
        <div className="space-y-3">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))
          ) : mitzvahs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Нет доступных бонусных мицвот на сегодня</p>
            </div>
          ) : (
            mitzvahs.map((m, i) => {
              const completed = completedIds.has(m.id);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={completed ? 'bg-success/5 border-success/20' : ''}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <span className="text-2xl">{getMitzvahIcon(m)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{m.name_ru}</p>
                        {m.description_ru && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{m.description_ru}</p>
                        )}
                      </div>
                      {completed ? (
                        <Badge className="bg-success/10 text-success border-0">
                          <Check className="w-3 h-3 mr-1" />
                          ✓
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant={limitReached ? 'outline' : 'default'}
                          disabled={limitReached || submitting === m.id}
                          onClick={() => handleBonus(m.id)}
                        >
                          {submitting === m.id ? (
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          ) : (
                            <>
                              <Star className="w-3 h-3 mr-1" />
                              +1
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
