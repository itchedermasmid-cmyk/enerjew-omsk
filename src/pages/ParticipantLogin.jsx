import React, { useState } from 'react';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, LogIn, Smartphone, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';

const cleanPin = value => value.replace(/\D/g, '').slice(0, 6);

export default function ParticipantLogin() {
  const { login, registerParticipant } = useParticipant();
  const [mode, setMode] = useState('signup');
  const [loginName, setLoginName] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginName.trim() || !loginPin) {
      setError('Введите имя и PIN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(loginName, loginPin);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName.trim() || !gender || !pin || !confirmPin) {
      setError('Заполните все поля');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN-коды не совпадают');
      return;
    }
    if (!phoneConfirmed) {
      setError('Подтвердите, что это ваш главный телефон');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerParticipant({ fullName, gender, pin });
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
        <div className="text-center mb-6">
          <div className="w-28 h-24 mx-auto mb-4 bg-card rounded-2xl flex items-center justify-center shadow-lg p-3">
            <Logo className="max-w-full max-h-full w-auto" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">EnerJew Omsk</h1>
          <p className="text-muted-foreground mt-1">Летняя кампания мицвот</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  mode === 'signup' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Первый раз
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Уже есть PIN
              </button>
            </div>

            {mode === 'signup' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Имя и фамилия
                  </label>
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Например: Даниэль Иванов"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Кто ты?</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Выберите..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мальчик</SelectItem>
                      <SelectItem value="female">Девочка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      PIN
                    </label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={e => setPin(cleanPin(e.target.value))}
                      className="h-12 text-center text-xl tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Повторить</label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={confirmPin}
                      onChange={e => setConfirmPin(cleanPin(e.target.value))}
                      className="h-12 text-center text-xl tracking-widest"
                      onKeyDown={e => e.key === 'Enter' && handleSignup()}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhoneConfirmed(value => !value)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    phoneConfirmed ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded border ${
                      phoneConfirmed ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                    }`}>
                      {phoneConfirmed ? '✓' : ''}
                    </span>
                    <span>
                      <span className="flex items-center gap-2 font-medium">
                        <Smartphone className="w-4 h-4 text-primary" />
                        Это мой главный телефон
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        После регистрации этот аккаунт будет работать на этом телефоне.
                      </span>
                    </span>
                  </span>
                </button>

                <Button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Создать аккаунт
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Имя и фамилия
                  </label>
                  <Input
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    placeholder="Введите своё имя..."
                    className="h-12 text-base"
                  />
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
                    value={loginPin}
                    onChange={e => setLoginPin(cleanPin(e.target.value))}
                    className="h-12 text-center text-xl tracking-widest"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loading || !loginName.trim() || !loginPin}
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
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
