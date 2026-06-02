import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getProgressLevelName } from '@/lib/campaign';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import ParticipantAvatar, { getAvailableAvatars, getDefaultAvatarId } from '@/components/participant/ParticipantAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Flame, Target, Award, Trophy, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileScreen() {
  const { participant, refresh, logout } = useParticipant();
  const [mitzvah, setMitzvah] = useState(null);
  const [badges, setBadges] = useState([]);
  const [savingAvatar, setSavingAvatar] = useState('');

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
  const avatarOptions = getAvailableAvatars(p?.gender);
  const selectedAvatarId = p?.avatar_id || getDefaultAvatarId(p?.gender);

  const selectAvatar = async (avatarId) => {
    if (!p || savingAvatar) return;
    setSavingAvatar(avatarId);
    try {
      await base44.entities.Participant.update(p.id, { avatar_id: avatarId });
      await refresh();
      toast.success('Аватар обновлён');
    } catch {
      toast.error('Не удалось сохранить аватар');
    } finally {
      setSavingAvatar('');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Профиль" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <ParticipantAvatar participant={p} className="w-24 h-24 mx-auto mb-4 border-4 border-primary/10 shadow-sm" />
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
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold">Выбери аватар</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Он будет виден в приложении и в рейтинге.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.map(avatar => {
                const selected = selectedAvatarId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => selectAvatar(avatar.id)}
                    disabled={!!savingAvatar}
                    className={`relative rounded-full transition-all ${
                      selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                    }`}
                    aria-label={`Выбрать аватар: ${avatar.label}`}
                  >
                    <ParticipantAvatar
                      participant={p}
                      avatarId={avatar.id}
                      className="w-full aspect-square"
                    />
                    {savingAvatar === avatar.id && (
                      <span className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="border-t pt-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                <p>Личное фото можно будет добавить позже, после подключения защищённых личных аккаунтов.</p>
              </div>
            </div>
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

        <Button variant="outline" className="w-full text-destructive" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Выйти из аккаунта
        </Button>
      </div>
      
      <BottomNav />
    </div>
  );
}
