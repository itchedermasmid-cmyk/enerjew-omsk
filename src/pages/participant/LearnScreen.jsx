import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getOmskDate } from '@/lib/campaign';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Check, ChevronRight, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function LearnScreen() {
  const { participant, refresh } = useParticipant();
  const [torahItems, setTorahItems] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const today = getOmskDate();

  useEffect(() => {
    loadData();
  }, [participant]);

  const loadData = async () => {
    if (!participant) return;
    const [items, comps] = await Promise.all([
      base44.entities.DailyTorah.filter({ status: 'published' }),
      base44.entities.TorahCompletion.filter({ participant_id: participant.id })
    ]);
    setTorahItems(items.sort((a, b) => b.date.localeCompare(a.date)));
    setCompletions(comps);
    setLoading(false);

    // Auto-select today's item
    const todayItem = items.find(i => i.date === today);
    if (todayItem && !selectedItem) setSelectedItem(todayItem);
  };

  const completedIds = new Set(completions.map(c => c.torah_id));

  const handleComplete = async (item) => {
    if (completedIds.has(item.id) || submitting) return;
    setSubmitting(true);
    
    // Determine credit type
    // Find the Torah learning mitzvah
    const mitzvahs = await base44.entities.Mitzvah.filter({ is_active: true });
    const torahMitzvah = mitzvahs.find(m => m.name_ru === 'Изучение Торы');
    
    let creditAs = 'read_only';
    
    if (torahMitzvah && participant.main_mitzvah_id === torahMitzvah.id) {
      // Check if they already have a main check-in today
      const existingMain = await base44.entities.MainCheckIn.filter({
        participant_id: participant.id, eligible_date: item.date, is_valid: true
      });
      if (existingMain.length === 0) {
        creditAs = 'main';
        // Create main check-in
        await base44.entities.MainCheckIn.create({
          participant_id: participant.id,
          mitzvah_id: torahMitzvah.id,
          eligible_date: item.date,
          source: 'torah_completion'
        });
      }
    } else if (torahMitzvah) {
      // Check if they already have a bonus for Torah today
      const existingBonus = await base44.entities.BonusCheckIn.filter({
        participant_id: participant.id, mitzvah_id: torahMitzvah.id,
        eligible_date: item.date, is_valid: true
      });
      // Check daily bonus limit
      const todayBonuses = await base44.entities.BonusCheckIn.filter({
        participant_id: participant.id, eligible_date: item.date, is_valid: true
      });
      if (existingBonus.length === 0 && todayBonuses.length < 3) {
        creditAs = 'bonus';
        await base44.entities.BonusCheckIn.create({
          participant_id: participant.id,
          mitzvah_id: torahMitzvah.id,
          eligible_date: item.date,
          stars_awarded: 1,
          source: 'torah_completion'
        });
      }
    }

    await base44.entities.TorahCompletion.create({
      participant_id: participant.id,
      torah_id: item.id,
      completion_date: item.date,
      credited_as: creditAs
    });

    await refresh();
    await loadData();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Ежедневная Тора" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {selectedItem ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItem(null)}
              className="mb-3"
            >
              ← Все записи
            </Button>
            
            <Card>
              {selectedItem.image_url && (
                <img src={selectedItem.image_url} alt="" className="w-full h-48 object-cover rounded-t-lg" />
              )}
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedItem.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </span>
                  {completedIds.has(selectedItem.id) && (
                    <Badge className="bg-success/10 text-success border-0 text-xs">
                      <Check className="w-3 h-3 mr-1" />Прочитано
                    </Badge>
                  )}
                </div>
                
                <h2 className="text-xl font-display font-bold mb-4">{selectedItem.title_ru}</h2>
                
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{selectedItem.content_ru}</ReactMarkdown>
                </div>

                {selectedItem.title_he && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-lg hebrew-text">
                    <p className="text-sm font-medium">{selectedItem.title_he}</p>
                  </div>
                )}

                {selectedItem.external_link && (
                  <a
                    href={selectedItem.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 text-primary text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Дополнительная ссылка
                  </a>
                )}

                {!completedIds.has(selectedItem.id) && (
                  <Button
                    onClick={() => handleComplete(selectedItem)}
                    disabled={submitting}
                    className="w-full mt-6 h-12"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Отметить как прочитано
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <div className="text-center py-2">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
              <h2 className="text-lg font-display font-bold">Ежедневная Тора</h2>
              <p className="text-sm text-muted-foreground">Учись каждый день</p>
            </div>

            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))
            ) : torahItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Записи появятся скоро</p>
              </div>
            ) : (
              <div className="space-y-2">
                {torahItems.map((item, i) => {
                  const isToday = item.date === today;
                  const completed = completedIds.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isToday ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            completed ? 'bg-success/10' : isToday ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            {completed ? (
                              <Check className="w-5 h-5 text-success" />
                            ) : (
                              <BookOpen className={`w-5 h-5 ${isToday ? 'text-primary' : 'text-muted-foreground'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title_ru}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              {isToday && <span className="text-primary ml-1">• Сегодня</span>}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}