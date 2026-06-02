import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getProgressLevelName } from '@/lib/campaign';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Star, Flame, Target, Award, Trophy } from 'lucide-react';

export default function ProfileScreen() {
  const { participant } = useParticipant();
  const [mitzvah, setMitzvah] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!participant) return;
    const load = async () => {
      if (participant.main_mitzvah_id) {
        const m = await base44.entities.Mitzvah.filter({ id: participant.main_mitzvah_id });
        if (m.length > 0) setMitzvah(m[0]);
      }
      const b = await base44.entities.Badge.filter({ is_active: true });
      setBadges(b);
    };
    load();
  }, [participant]);

  const p = participant;
  const earnedBadgeIds = new Set(p?.badges || []);
  const earnedBadges = badges.filter(b => earnedBadgeIds.has(b.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Профиль" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold">{p?.full_name}</h2>
            {p?.nickname && (
              <p className="text-muted-foreground">«{p.nickname}»</p>
            )}
            <Badge className="mt-2 bg-primary/10 text-primary border-0">
              {getProgressLevelName(p?.progress_level || 'beginner')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Моя миссия</h3>
            <p className="text-lg font-bold text-primary">{mitzvah?.name_ru || 'Не выбрана'}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{p?.mission_progress || 0}%</p>
              <p className="text-xs text-muted-foreground">прогресс</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-xl font-bold">{p?.bonus_stars || 0}</p>
              <p className="text-xs text-muted-foreground">бонусов</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{p?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">серия</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-xl font-bold">{p?.best_streak || 0}</p>
              <p className="text-xs text-muted-foreground">лучшая</p>
            </CardContent>
          </Card>
        </div>

        {earnedBadges.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                Мои значки
              </h3>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map(b => (
                  <Badge key={b.id} className="bg-secondary/10 text-secondary border-0 px-3 py-1.5">
                    {b.icon || '🏅'} {b.name_ru}
                  </Badge>
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