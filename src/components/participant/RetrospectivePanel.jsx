import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { canSubmitRetrospective, formatDateRu } from '@/lib/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Check } from 'lucide-react';

export default function RetrospectivePanel() {
  const { participant } = useParticipant();
  const [periods, setPeriods] = useState([]);
  const [retroCheckins, setRetroCheckins] = useState([]);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    loadData();
  }, [participant]);

  const loadData = async () => {
    if (!participant) return;
    const allPeriods = await base44.entities.ClosurePeriod.list('-end_time', 5);
    const now = new Date();
    
    // Find recently ended closure periods that allow retrospective
    const eligible = allPeriods.filter(p => {
      const endTime = new Date(p.end_time);
      return endTime < now && canSubmitRetrospective(p);
    });
    
    setPeriods(eligible);

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
    
    await loadData();
    setSubmitting(null);
  };

  if (periods.length === 0) return null;

  // Get the Shabbos dates (Friday, Saturday) from closure periods
  const retroDates = [];
  periods.forEach(period => {
    const start = new Date(period.start_time);
    const end = new Date(period.end_time);
    const current = new Date(start);
    while (current <= end) {
      retroDates.push({
        date: current.toISOString().split('T')[0],
        period
      });
      current.setDate(current.getDate() + 1);
    }
  });

  const submittedDates = new Set(retroCheckins.map(c => c.eligible_date));
  const pendingDates = retroDates.filter(d => !submittedDates.has(d.date));

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