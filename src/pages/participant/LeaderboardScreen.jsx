import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getProgressLevelName } from '@/lib/campaign';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import ParticipantAvatar from '@/components/participant/ParticipantAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Flame, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaderboardScreen() {
  const { participant } = useParticipant();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Participant.filter({ status: 'active', onboarding_complete: true })
      .then(list => {
        setParticipants(list);
        setLoading(false);
      });
  }, []);

  // Sort: mission_progress desc, current_streak desc, bonus_stars desc
  const sorted = [...participants].sort((a, b) => {
    if ((b.mission_progress || 0) !== (a.mission_progress || 0))
      return (b.mission_progress || 0) - (a.mission_progress || 0);
    if ((b.current_streak || 0) !== (a.current_streak || 0))
      return (b.current_streak || 0) - (a.current_streak || 0);
    return (b.bonus_stars || 0) - (a.bonus_stars || 0);
  });

  const getDisplayName = (p) => p.nickname || p.full_name?.split(' ')[0] || 'Участник';
  
  const closestToTrip = [...participants]
    .filter(p => (p.mission_progress || 0) < 80)
    .sort((a, b) => (b.mission_progress || 0) - (a.mission_progress || 0))
    .slice(0, 3);

  const longestStreak = [...participants]
    .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))
    .slice(0, 3);

  const mostBonusStars = [...participants]
    .sort((a, b) => (b.bonus_stars || 0) - (a.bonus_stars || 0))
    .slice(0, 3);

  const rankColors = ['bg-secondary text-secondary-foreground', 'bg-muted text-foreground', 'bg-muted text-foreground'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Рейтинг" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Tabs defaultValue="main">
          <TabsList className="w-full">
            <TabsTrigger value="main" className="flex-1">Рейтинг</TabsTrigger>
            <TabsTrigger value="highlights" className="flex-1">Достижения</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-4 space-y-2">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))
            ) : sorted.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Пока нет участников</p>
              </div>
            ) : (
              sorted.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={p.id === participant?.id ? 'ring-2 ring-primary' : ''}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i < 3 ? rankColors[i] : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </div>
                      <ParticipantAvatar participant={p} className="w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {getDisplayName(p)}
                          {p.id === participant?.id && (
                            <span className="text-primary ml-1">(вы)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getProgressLevelName(p.progress_level || 'beginner')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-sm font-bold">{p.mission_progress || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Flame className="w-3 h-3" />
                          <span>{p.current_streak || 0}</span>
                          <Star className="w-3 h-3 ml-1" />
                          <span>{p.bonus_stars || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="highlights" className="mt-4 space-y-4">
            {/* Closest to trip */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">Ближе всех к поездке</h3>
                </div>
                {closestToTrip.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Все уже квалифицировались!</p>
                ) : (
                  <div className="space-y-2">
                    {closestToTrip.map(p => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-sm">{getDisplayName(p)}</span>
                        <Badge variant="secondary">{p.mission_progress || 0}% → 80%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Longest streak */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">Самая длинная серия</h3>
                </div>
                <div className="space-y-2">
                  {longestStreak.map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-sm">{getDisplayName(p)}</span>
                      <Badge variant="secondary">{p.current_streak || 0} дней 🔥</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most bonus stars */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-sm">Больше всех бонусов</h3>
                </div>
                <div className="space-y-2">
                  {mostBonusStars.map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-sm">{getDisplayName(p)}</span>
                      <Badge variant="secondary">{p.bonus_stars || 0} ⭐</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
  );
}
