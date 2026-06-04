import React from 'react';
import { cn } from '@/lib/utils';

export const PARTICIPANT_AVATARS = [
  { id: 'boy-navy', gender: 'male', label: 'Синий', bg: '#dcecff', shirt: '#3f6fd1', skin: '#edbd96', hair: '#493226', kippah: '#274d9b', style: 'straight' },
  { id: 'boy-green', gender: 'male', label: 'Зелёный', bg: '#dcf6e8', shirt: '#3d8a67', skin: '#d99f72', hair: '#2e241f', kippah: '#2d6f52', style: 'curly' },
  { id: 'boy-gold', gender: 'male', label: 'Золотой', bg: '#fff1cf', shirt: '#d68a1f', skin: '#f2c7a8', hair: '#78543b', kippah: '#a96718', style: 'side' },
  { id: 'boy-purple', gender: 'male', label: 'Фиолетовый', bg: '#ede5ff', shirt: '#7357b8', skin: '#bc815f', hair: '#2f2825', kippah: '#5b3e9b', style: 'straight' },
  { id: 'girl-coral', gender: 'female', label: 'Коралловый', bg: '#ffe6e0', shirt: '#d96458', skin: '#edbd96', hair: '#6b4334', accent: '#ef9b8f', style: 'long' },
  { id: 'girl-teal', gender: 'female', label: 'Бирюзовый', bg: '#dcf6f3', shirt: '#28978f', skin: '#d99f72', hair: '#302521', accent: '#66c8bf', style: 'round' },
  { id: 'girl-gold', gender: 'female', label: 'Золотой', bg: '#fff1cf', shirt: '#d68a1f', skin: '#f2c7a8', hair: '#90613d', accent: '#f3bc55', style: 'long' },
  { id: 'girl-violet', gender: 'female', label: 'Фиолетовый', bg: '#eee4ff', shirt: '#7357b8', skin: '#bc815f', hair: '#302525', accent: '#a78adf', style: 'round' },
];

const LEGACY_AVATAR_MAP = {
  'boy-blue': 'boy-navy',
  'boy-gold': 'boy-gold',
  'boy-purple': 'boy-purple',
  'badge-blue': 'boy-navy',
  'badge-green': 'boy-green',
  'badge-gold': 'boy-gold',
  'badge-purple': 'boy-purple',
  'girl-purple': 'girl-violet',
  'badge-coral': 'girl-coral',
  'badge-teal': 'girl-teal',
  'badge-sun': 'girl-gold',
  'badge-violet': 'girl-violet',
};

export function getAvailableAvatars(gender) {
  return PARTICIPANT_AVATARS.filter(avatar => avatar.gender === gender);
}

export function getDefaultAvatarId(gender) {
  return gender === 'female' ? 'girl-coral' : 'boy-navy';
}

function BoyAvatar({ avatar }) {
  const curly = avatar.style === 'curly';
  const side = avatar.style === 'side';

  return (
    <>
      <path d="M20 101c4-23 17-35 30-35s26 12 30 35H20Z" fill={avatar.shirt} />
      <path d="M41 63h18v17H41Z" fill={avatar.skin} />
      <circle cx="50" cy="43" r="22" fill={avatar.skin} />
      <path
        d={side ? 'M29 38c6-17 31-21 42-3-13-2-24-5-35 2-2 1-5 1-7 1Z' : 'M28 39c4-18 37-24 44 0-13-5-30-8-44 0Z'}
        fill={avatar.hair}
      />
      {curly && (
        <>
          <circle cx="34" cy="36" r="4" fill={avatar.hair} />
          <circle cx="44" cy="31" r="4" fill={avatar.hair} />
          <circle cx="56" cy="31" r="4" fill={avatar.hair} />
          <circle cx="66" cy="36" r="4" fill={avatar.hair} />
        </>
      )}
      <path d="M39 22c6-5 16-6 23 0-7 4-16 4-23 0Z" fill={avatar.kippah} />
      <path d="M39 22c6 3 16 3 23 0" fill="none" stroke="#fff" strokeWidth="2" opacity="0.45" />
      <path d="M31 100c4-13 11-20 19-20s15 7 19 20" fill="none" stroke="#fff" strokeWidth="3" opacity="0.35" />
    </>
  );
}

function GirlAvatar({ avatar }) {
  const round = avatar.style === 'round';

  return (
    <>
      <path d="M20 101c4-23 17-35 30-35s26 12 30 35H20Z" fill={avatar.shirt} />
      <path d="M41 63h18v17H41Z" fill={avatar.skin} />
      <path
        d={round ? 'M27 45c0-20 10-31 23-31s23 11 23 31v27c-6-3-14-5-23-5s-17 2-23 5V45Z' : 'M27 45c0-22 10-33 23-33s23 11 23 33v31c-7-4-15-6-23-6s-16 2-23 6V45Z'}
        fill={avatar.hair}
      />
      <circle cx="50" cy="43" r="22" fill={avatar.skin} />
      <path d="M29 39c7-17 34-21 42 0-14-4-28-10-42 0Z" fill={avatar.hair} />
      <path d="M31 35c11-7 27-8 38 0" fill="none" stroke={avatar.accent} strokeWidth="4" strokeLinecap="round" />
      <circle cx="29" cy="49" r="3" fill={avatar.hair} />
      <circle cx="71" cy="49" r="3" fill={avatar.hair} />
      <path d="M31 100c4-13 11-20 19-20s15 7 19 20" fill="none" stroke="#fff" strokeWidth="3" opacity="0.35" />
    </>
  );
}

function CartoonAvatar({ avatar }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`Аватар: ${avatar.label}`}>
      <rect width="100" height="100" rx="50" fill={avatar.bg} />
      <circle cx="20" cy="22" r="9" fill="#fff" opacity="0.32" />
      <circle cx="82" cy="18" r="6" fill="#fff" opacity="0.24" />
      {avatar.gender === 'female' ? <GirlAvatar avatar={avatar} /> : <BoyAvatar avatar={avatar} />}
      <circle cx="42" cy="44" r="2.1" fill="#352923" />
      <circle cx="58" cy="44" r="2.1" fill="#352923" />
      <path d="M44 55c3.5 3 8.5 3 12 0" fill="none" stroke="#9d5e51" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="34" cy="51" r="3" fill="#e79089" opacity="0.34" />
      <circle cx="66" cy="51" r="3" fill="#e79089" opacity="0.34" />
    </svg>
  );
}

export default function ParticipantAvatar({
  participant,
  avatarId,
  className,
}) {
  if (!avatarId && participant?.avatar_url) {
    return (
      <div className={cn('overflow-hidden rounded-full bg-muted', className)}>
        <img src={participant.avatar_url} alt="Аватар участника" className="h-full w-full object-cover" />
      </div>
    );
  }

  const gender = participant?.gender || 'male';
  const normalizedId = LEGACY_AVATAR_MAP[avatarId || participant?.avatar_id] || avatarId || participant?.avatar_id;
  const selectedId = normalizedId || getDefaultAvatarId(gender);
  const selected = PARTICIPANT_AVATARS.find(avatar => avatar.id === selectedId)
    || PARTICIPANT_AVATARS.find(avatar => avatar.id === getDefaultAvatarId(gender));

  return (
    <div className={cn('overflow-hidden rounded-full bg-muted', className)}>
      <CartoonAvatar avatar={selected} />
    </div>
  );
}
