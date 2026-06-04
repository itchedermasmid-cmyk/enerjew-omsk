import React from 'react';
import { BookOpen, Flame, ShieldCheck, Sparkles, Star, Sun, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PARTICIPANT_AVATARS = [
  { id: 'badge-blue', gender: 'male', label: 'Синий', bg: '#dcecff', ring: '#3f6fd1', icon: BookOpen },
  { id: 'badge-green', gender: 'male', label: 'Зелёный', bg: '#dcf6e8', ring: '#3d8a67', icon: ShieldCheck },
  { id: 'badge-gold', gender: 'male', label: 'Золотой', bg: '#fff1cf', ring: '#d68a1f', icon: Trophy },
  { id: 'badge-purple', gender: 'male', label: 'Фиолетовый', bg: '#ede5ff', ring: '#7357b8', icon: Zap },
  { id: 'badge-coral', gender: 'female', label: 'Коралловый', bg: '#ffe6e0', ring: '#d96458', icon: Flame },
  { id: 'badge-teal', gender: 'female', label: 'Бирюзовый', bg: '#dcf6f3', ring: '#28978f', icon: Sparkles },
  { id: 'badge-sun', gender: 'female', label: 'Солнечный', bg: '#fff1cf', ring: '#d68a1f', icon: Sun },
  { id: 'badge-violet', gender: 'female', label: 'Фиолетовый', bg: '#eee4ff', ring: '#7357b8', icon: Star },
];

const LEGACY_AVATAR_MAP = {
  'boy-blue': 'badge-blue',
  'boy-green': 'badge-green',
  'boy-gold': 'badge-gold',
  'boy-purple': 'badge-purple',
  'girl-coral': 'badge-coral',
  'girl-teal': 'badge-teal',
  'girl-gold': 'badge-sun',
  'girl-purple': 'badge-violet',
};

export function getAvailableAvatars(gender) {
  return PARTICIPANT_AVATARS.filter(avatar => avatar.gender === gender);
}

export function getDefaultAvatarId(gender) {
  return gender === 'female' ? 'badge-coral' : 'badge-blue';
}

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'EJ';
  return words.slice(0, 2).map(word => word[0]?.toUpperCase()).join('');
}

function MissionBadge({ avatar, participant }) {
  const Icon = avatar.icon;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-full"
      style={{ backgroundColor: avatar.bg }}
      role="img"
      aria-label={`Аватар: ${avatar.label}`}
    >
      <div className="absolute inset-[11%] rounded-full bg-white/90" />
      <div
        className="absolute inset-[15%] rounded-full border-[5px]"
        style={{ borderColor: avatar.ring }}
      />
      <div
        className="absolute right-[17%] top-[15%] h-[15%] w-[15%] rounded-full opacity-20"
        style={{ backgroundColor: avatar.ring }}
      />
      <div
        className="absolute bottom-[14%] left-[16%] h-[20%] w-[20%] rounded-full opacity-15"
        style={{ backgroundColor: avatar.ring }}
      />
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <Icon className="h-[32%] w-[32%]" style={{ color: avatar.ring }} />
        <span
          className="text-[0.7em] font-bold leading-none tracking-wide"
          style={{ color: avatar.ring }}
        >
          {getInitials(participant?.nickname || participant?.full_name)}
        </span>
      </div>
    </div>
  );
}

export default function ParticipantAvatar({
  participant,
  avatarId,
  className,
}) {
  const gender = participant?.gender || 'male';
  const normalizedId = LEGACY_AVATAR_MAP[avatarId || participant?.avatar_id] || avatarId || participant?.avatar_id;
  const selectedId = normalizedId || getDefaultAvatarId(gender);
  const selected = PARTICIPANT_AVATARS.find(avatar => avatar.id === selectedId)
    || PARTICIPANT_AVATARS.find(avatar => avatar.id === getDefaultAvatarId(gender));

  return (
    <div className={cn('overflow-hidden rounded-full bg-muted', className)}>
      <MissionBadge avatar={selected} participant={participant} />
    </div>
  );
}
