import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { getProgressLevelName } from '@/lib/campaign';
import BottomNav from '@/components/participant/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Star, Flame, Target, Award, Trophy } from 'lucide-react';
import AvatarPickerScreen from '@/components/participant/AvatarPickerScreen';

export default function ProfileScreen() {
  const { participant, setParticipant } = useParticipant();
  const [mitzvah, setMitzvah] = useState(null);
  const [badges, setBadges] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef();

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

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Participant.update(p.id, { avatar_url: file_url });
    setParticipant({ ...p, avatar_url: file_url });
    setUploading(false);
  };

  if (showPicker) return <AvatarPickerScreen onDone={() => setShowPicker(false)} />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />

      {/* Hero profile section */}
      <div className="bg-gradient-to-b from-primary/15 to-background pt-10 pb-6 px-4 text-center">
        <div className="relative w-28 h-28 mx-auto mb-3">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <img src={p?.avatar_url} alt={p?.full_name} className="w-full h-full object-cover" />
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <h2 className="text-2xl font-display font-bold">{p?.full_name}</h2>
        {p?.nickname && <p className="text-muted-foreground">«{p.nickname}»</p>}
        <Badge className="mt-2 bg-primary/10 text-primary border-0">
          {getProgressLevelName(p?.progress_level || 'beginner')}
        </Badge>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Моя миссия</h3>
            <p className="text-lg font-bold text-primary">{mitzvah?.name_ru || 'Не выбрана'}</p>
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