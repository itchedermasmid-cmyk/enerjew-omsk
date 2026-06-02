import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { canSubmitRetrospective, formatDateRu, getOmskDate, isMitzvahEligibleOnDate, parseOmskDateTime } from '@/lib/campaign';
import { recalculateParticipantStats } from '@/lib/participantStats';
import { assertParticipantActionsOpen } from '@/lib/participantActions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function RetrospectivePanel() {
  const { participant, refresh } = useParticipant();
  const [periods, setPeriods] = useState([]);
  const [retroCheckins, setRetroCheckins] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [mitzvah, setMitzvah] = useState(null);

  useEffect(() => {
    loadData();
  }, [participant]);

  const loadData = async () => {
    if (!participant) return;
    const [allPeriods, mitzvahs] = await Promise.all([
      base44.entities.ClosurePeriod.list('-end_time', 5),
      base44.entities.Mitzvah.filter({ id: participant.main_mitzvah_id }),
    ]);
    const now = new Date();
    
    // Find recently ended closure periods that allow retrospective
    const eligible = allPeriods.filter(p => {
      const endTime = parseOmskDateTime(p.end_time);
      return endTime < now && canSubmitRetrospective(p);
    });
    
    setPeriods(eligible);
    setMitzvah(mitzvahs[0] || null);

    if (eligible.length > 0) {
      const checkins = await base44.entities.MainCheckIn.filter({
        participant_id: participant.id,
        is_retrospective: true
      });
      setRetroCheckins(checkins);
    }
  };

  const handleRetroCheckin = async (dateStr) => {
    if (!participant?.main_mitzvah_id) return;
    setSubmitting(dateStr);
    try {
      await assertParticipantActionsOpen(dateStr);

      // Check for duplicate
      const existing = await base44.entities.MainCheckIn.filter({
        participant_id: participant.id,
        eligible_date: dateStr,
        is_valid: true
      });

      if (existing.length === 0) {
        await base44.entities.MainCheckIn.create({
          participant_id: participant.id,
          mitzvah_id: participant.main_mitzvah_id,
          eligible_date: dateStr,
          is_retrospective: true,
          source: 'participant'
        });
      }

      await recalculateParticipantStats(participant, mitzvah);
      await refresh();
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Не удалось сохранить отметку');
    } finally {
      setSubmitting(null);
    }
  };

  if (periods.length === 0) return null;

  // Get the Shabbos dates (Friday, Saturday) from closure periods
  const retroDates = [];
  periods.forEach(period => {
    const start = parseOmskDateTime(period.start_time);
    const end = parseOmskDateTime(period.end_time);
    const current = new Date(start);
    while (current <= end) {
      const date = getOmskDate(current);
      retroDates.push({
        date,
        period
      });
      current.setDate(current.getDate() + 1);
    }
  });

  const submittedDates = new Set(retroCheckins.map(c => c.eligible_date));
  const pendingDates = retroDates.filter((item, index) =>
    isMitzvahEligibleOnDate(mitzvah, item.date) &&
    !submittedDates.has(item.date) &&
    retroDates.findIndex(other => other.date === item.date) === index
  );

  if (pendingDates.length === 0) return null;

  return (
    <Card className="border-secondary/30 bg-secondary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-secondary" />
          <p className="font-semibold text-sm">Ретроспективная отметка</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Отметьте мицвы, выполненные во время Шаббата
        </p>
        <div className="space-y-2">
          {pendingDates.slice(0, 3).map(({ date }) => (
            <div key={date} className="flex items-center justify-between bg-card rounded-lg p-3 border">
              <span className="text-sm font-medium">{formatDateRu(date)}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRetroCheckin(date)}
                disabled={submitting === date}
              >
                {submitting === date ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Выполнено
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
