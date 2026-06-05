import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { Button } from '@/components/ui/button';
import { Camera, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Jewish traditional boy avatars — DiceBear avataaars v7, correct param names
const BOY_AVATARS = [
  // Black hat + full beard (Chassidish)
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Yosef&top%5B%5D=Hat&facialHair%5B%5D=BeardMagestic&clothing%5B%5D=BlazerShirt&backgroundColor=b6e3f4',
  // Black hat + light beard
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Moshe&top%5B%5D=Hat&facialHair%5B%5D=BeardLight&clothing%5B%5D=CollarSweater&backgroundColor=ffdfbf',
  // Short curly + medium beard (Yeshiva)
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dovid&top%5B%5D=ShortHairShortCurly&facialHair%5B%5D=BeardMedium&clothing%5B%5D=BlazerSweater&backgroundColor=d1d4f9',
  // Black hat + medium beard
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aron&top%5B%5D=Hat&facialHair%5B%5D=BeardMedium&clothing%5B%5D=Hoodie&backgroundColor=c0aede',
  // Short flat + light beard (Modern Orthodox)
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Levi&top%5B%5D=ShortHairShortFlat&facialHair%5B%5D=BeardLight&clothing%5B%5D=ShirtVNeck&backgroundColor=ffd5dc',
  // Winter hat + full beard (Breslev)
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nosson&top%5B%5D=WinterHat4&facialHair%5B%5D=BeardMagestic&clothing%5B%5D=ShirtCrewNeck&backgroundColor=b6e3f4',
  // Black hat + clean shaven (young bochur)
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Menachem&top%5B%5D=Hat&facialHair%5B%5D=Blank&clothing%5B%5D=BlazerShirt&backgroundColor=d1d4f9',
  // Curly short + moustache (Sephardic)
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Shlomo&top%5B%5D=ShortHairTheCaesar&facialHair%5B%5D=MoustacheFancy&clothing%5B%5D=BlazerSweater&backgroundColor=ffdfbf',
];

// Jewish traditional girl avatars — modest clothing, long/covered hair
const GIRL_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chana&top%5B%5D=LongHairStraight&clothing%5B%5D=BlazerShirt&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Rivka&top%5B%5D=LongHairBun&clothing%5B%5D=CollarSweater&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leah&top%5B%5D=LongHairCurly&clothing%5B%5D=BlazerSweater&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Devorah&top%5B%5D=LongHairNotTooLong&clothing%5B%5D=CollarSweater&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara&top%5B%5D=LongHairStraight2&clothing%5B%5D=BlazerShirt&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Miriam&top%5B%5D=Hijab&clothing%5B%5D=BlazerShirt&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Esther&top%5B%5D=LongHairBob&clothing%5B%5D=ShirtVNeck&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Batsheva&top%5B%5D=LongHairCurvy&clothing%5B%5D=CollarSweater&backgroundColor=ffdfbf',
];

export default function AvatarPickerScreen({ onDone }) {
  const { participant, setParticipant } = useParticipant();
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const avatars = participant?.gender === 'female' ? GIRL_AVATARS : BOY_AVATARS;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSelected(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.Participant.update(participant.id, { avatar_url: selected });
    setParticipant({ ...participant, avatar_url: selected });
    setSaving(false);
    if (onDone) onDone();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold">Выбери аватар</h1>
          <p className="text-muted-foreground mt-1">Выбери картинку или загрузи своё фото</p>
        </div>

        {/* Selected preview */}
        {selected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-5"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-xl">
              <img src={selected} alt="preview" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Avatar grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {avatars.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(url)}
              className={`relative rounded-2xl overflow-hidden border-3 transition-all aspect-square ${
                selected === url
                  ? 'ring-4 ring-primary ring-offset-2 scale-105'
                  : 'border border-border hover:border-primary/50'
              }`}
            >
              <img src={url} alt={`avatar ${i + 1}`} className="w-full h-full object-cover" />
              {selected === url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Upload button */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button
          variant="outline"
          className="w-full mb-3"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin mr-2" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {uploading ? 'Загрузка...' : 'Загрузить своё фото'}
        </Button>

        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSave}
          disabled={!selected || saving}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : 'Продолжить →'}
        </Button>
      </motion.div>
    </div>
  );
}