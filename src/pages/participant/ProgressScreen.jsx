import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getProgressLevelName } from '@/lib/campaign';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Flame, Star, Award, Trophy, Zap, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressScreen() {
  const { participant } = useParticipant();
  const [mitzvah, setMitzvah] = useState(null);
  const [badges, setBadges] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);

  useEffect(() => {
    if (!participant) return;
    
    const load = async () => {
      const promises = [
        participant.main_mitzvah_id
          ? base44.entities.Mitzvah.filter({ id: participant.main_mitzvah_id })
          : Promise.resolve([]),
        base44.entities.Badge.filter({ is_active: true }),
        base44.entities.MainCheckIn.filter({ participant_id: participant.id, is_valid: true })
      ];
      const [m, b, ci] = await Promise.all(promises);
      setMitzvah(m[0] || null);
      setBadges(b);
      setRecentCheckIns(ci.sort((a, b) => b.eligible_date.localeCompare(a.eligible_date)).slice(0, 10));
    };
    load();
  }, [participant]);

  const p = participant;
  const progress = p?.mission_progress || 0;
  const earnedBadgeIds = new Set(p?.badges || []);
  const earnedBadges = badges.filter(b => earnedBadgeIds.has(b.id));
  const nextBadge = badges.find(b => !earnedBadgeIds.has(b.id));

  const milestones = [
    { label: 'Уверенный старт', threshold: 25, icon: Zap },
    { label: 'Герой на полпути', threshold: 50, icon: Target },
    { label: 'Поездка заслужена', threshold: 80, icon: Trophy },
    { label: 'Чемпион лета', threshold: 100, icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Мой прогресс" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Mission Progress Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
            <p className="text-sm opacity-90">Миссия</p>
            <p className="text-xl font-bold">{mitzvah?.name_ru || 'Не выбрана'}</p>
          </div>
          <CardContent className="p-4 space-y-4">
            {/* Big progress circle */}
            <div className="text-center py-4">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${progress * 2.76} 276`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{progress}%</span>
                  <span className="text-xs text-muted-foreground">прогресс</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{p?.completed_eligible || 0}</p>
                <p className="text-xs text-muted-foreground">выполнено</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{p?.eligible_so_far || 0}</p>
                <p className="text-xs text-muted-foreground">всего дней</p>
              </div>
            </div>

            {/* Trip qualification bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">До поездки (80%)</span>
                <span className="font-medium">{Math.min(progress, 80)}/80</span>
              </div>
              <Progress value={Math.min(progress, 80)} max={80} className="h-2" />
            </div>

            {/* Champion bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Чемпион лета (100%)</span>
                <span className="font-medium">{progress}/100</span>
              </div>
              <Progress value={progress} max={100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Bonus Stars */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">Бонусные звёзды</h3>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-secondary">{p?.bonus_stars || 0}</span>
              <span className="text-sm text-muted-foreground">/ 100 для спецприза</span>
            </div>
            <Progress value={Math.min(p?.bonus_stars || 0, 100)} max={100} className="h-2" />
            {p?.special_prize_earned && (
              <div className="mt-3 flex items-center gap-2 bg-secondary/10 rounded-lg p-2">
                <Gift className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Спецприз заслужен!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{p?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">текущая серия</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold">{p?.best_streak || 0}</p>
              <p className="text-xs text-muted-foreground">лучшая серия</p>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Вехи прогресса</h3>
            <div className="space-y-3">
              {milestones.map(m => {
                const reached = progress >= m.threshold;
                const Icon = m.icon;
                return (
                  <div key={m.threshold} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${reached ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {m.label}
                      </p>
                    </div>
                    <span className={`text-sm ${reached ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {m.threshold}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Значки</h3>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map(b => (
                  <Badge key={b.id} className="bg-primary/10 text-primary border-0 px-3 py-1">
                    {b.icon || '🏅'} {b.name_ru}
                  </Badge>
                ))}
              </div>
              {nextBadge && (
                <p className="text-xs text-muted-foreground mt-3">
                  Следующий: {nextBadge.icon || '🏅'} {nextBadge.name_ru}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent activity */}
        {recentCheckIns.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Последняя активность</h3>
              <div className="space-y-2">
                {recentCheckIns.map(ci => (
                  <div key={ci.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-muted-foreground">
                      {new Date(ci.eligible_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>Основная мицва выполнена</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}