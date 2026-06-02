import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, User, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParticipantLogin() {
  const { login } = useParticipant();
  const [participants, setParticipants] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    base44.entities.Participant.filter({ status: 'active' })
      .then(list => {
        setParticipants(list.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru')));
      })
      .finally(() => setLoadingList(false));
  }, []);

  const handleLogin = async () => {
    if (!selectedId || !pin) {
      setError('Выберите имя и введите PIN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(selectedId, pin);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl font-display font-bold text-primary-foreground">EJ</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">EnerJew Omsk</h1>
          <p className="text-muted-foreground mt-1">Летняя кампания мицвот</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Ваше имя
              </label>
              {loadingList ? (
                <div className="h-10 bg-muted rounded-lg animate-pulse" />
              ) : (
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Выберите своё имя..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                PIN-код
              </label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Введите PIN..."
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-center text-xl tracking-widest"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <Button
              onClick={handleLogin}
              disabled={loading || !selectedId || !pin}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Войти
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Нет аккаунта? Обратитесь к администратору
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}