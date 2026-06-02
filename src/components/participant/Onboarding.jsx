import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { isMitzvahEligibleForGender } from '@/lib/campaign';
import { getMitzvahIcon } from '@/lib/mitzvahCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Check, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const { participant, refresh } = useParticipant();
  const [step, setStep] = useState(0);
  const [mitzvahs, setMitzvahs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Mitzvah.filter({ is_active: true, can_be_main: true })
      .then(list => {
        const eligible = list.filter(m => isMitzvahEligibleForGender(m, participant.gender));
        setMitzvahs(eligible.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      });
  }, [participant.gender]);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.Participant.update(participant.id, {
      main_mitzvah_id: selected.id,
      mission_selected: true,
      onboarding_complete: true
    });
    await refresh();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-secondary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-3">
                Добро пожаловать!
              </h1>
              <p className="text-muted-foreground mb-2 text-lg">
                {participant.full_name}, рады тебя видеть!
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Этим летом ты выберешь одну мицву — свою личную миссию. 
                Каждый день выполняй её, зарабатывай прогресс и бонусные звёзды!
              </p>
              <Button size="lg" onClick={() => setStep(1)} className="px-8 h-12 text-base">
                Выбрать мицву
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-display font-bold text-center mb-2">
                Выбери свою мицву
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Это будет твоя главная миссия на лето
              </p>
              
              <div className="space-y-3 mb-6">
                {mitzvahs.map(m => (
                  <Card
                    key={m.id}
                    className={`cursor-pointer transition-all ${
                      selected?.id === m.id 
                        ? 'ring-2 ring-primary bg-accent shadow-md' 
                        : 'hover:shadow-md hover:border-primary/30'
                    }`}
                    onClick={() => setSelected(m)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <span className="text-2xl">
                        {getMitzvahIcon(m)}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold">{m.name_ru}</p>
                        {m.description_ru && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{m.description_ru}</p>
                        )}
                      </div>
                      {selected?.id === m.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                size="lg"
                disabled={!selected}
                onClick={() => setStep(2)}
                className="w-full h-12 text-base"
              >
                Далее
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && selected && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">{getMitzvahIcon(selected)}</span>
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Подтверждение</h2>
              <p className="text-muted-foreground mb-6">
                Твоя главная миссия на лето:
              </p>
              
              <Card className="mb-6 bg-accent/50">
                <CardContent className="p-6">
                  <p className="text-xl font-bold text-primary">{selected.name_ru}</p>
                  {selected.description_ru && (
                    <p className="text-muted-foreground mt-2">{selected.description_ru}</p>
                  )}
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground mb-6">
                После подтверждения миссию нельзя будет изменить
              </p>

              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  disabled={saving}
                  className="w-full h-12 text-base"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Подтвердить выбор
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Назад к выбору
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
