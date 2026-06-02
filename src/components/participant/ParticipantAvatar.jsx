import React from 'react';
import { cn } from '@/lib/utils';

export const PARTICIPANT_AVATARS = [
  { id: 'boy-blue', gender: 'male', label: 'Синий', bg: '#dcecff', shirt: '#4f7fd8', skin: '#edbd96', hair: '#5a3a2e', accent: '#315caa', style: 1 },
  { id: 'boy-green', gender: 'male', label: 'Зелёный', bg: '#dcf6e8', shirt: '#4e9a72', skin: '#d99f72', hair: '#342821', accent: '#2f7253', style: 2 },
  { id: 'boy-gold', gender: 'male', label: 'Золотой', bg: '#fff1cf', shirt: '#dc9634', skin: '#f2c7a8', hair: '#855a3c', accent: '#a86618', style: 3 },
  { id: 'boy-purple', gender: 'male', label: 'Фиолетовый', bg: '#ede5ff', shirt: '#846bc4', skin: '#bc815f', hair: '#2d2625', accent: '#6049a0', style: 4 },
  { id: 'girl-coral', gender: 'female', label: 'Коралловый', bg: '#ffe6e0', shirt: '#df7666', skin: '#edbd96', hair: '#6b4334', accent: '#b84f45', style: 1 },
  { id: 'girl-teal', gender: 'female', label: 'Бирюзовый', bg: '#dcf6f3', shirt: '#42a49a', skin: '#d99f72', hair: '#322522', accent: '#287d76', style: 2 },
  { id: 'girl-gold', gender: 'female', label: 'Золотой', bg: '#fff1cf', shirt: '#d8993f', skin: '#f2c7a8', hair: '#9a653e', accent: '#ae711e', style: 3 },
  { id: 'girl-purple', gender: 'female', label: 'Фиолетовый', bg: '#eee4ff', shirt: '#916cc4', skin: '#bc815f', hair: '#302525', accent: '#6847a0', style: 4 },
];

export function getAvailableAvatars(gender) {
  return PARTICIPANT_AVATARS.filter(avatar => avatar.gender === gender);
}

export function getDefaultAvatarId(gender) {
  return gender === 'female' ? 'girl-coral' : 'boy-blue';
}

function IllustratedAvatar({ avatar }) {
  const isGirl = avatar.gender === 'female';
  const eyeOffset = avatar.style === 4 ? 1 : 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`Аватар: ${avatar.label}`}>
      <rect width="100" height="100" rx="50" fill={avatar.bg} />
      <circle cx="18" cy="22" r="10" fill="#fff" opacity=".35" />
      <circle cx="83" cy="17" r="7" fill="#fff" opacity=".25" />
      <path d="M16 101c4-22 18-33 34-33s30 11 34 33H16Z" fill={avatar.shirt} />
      <path d="M42 63h16v15H42Z" fill={avatar.skin} />
      {isGirl ? (
        <>
          <path d="M27 46c0-23 11-34 23-34 14 0 25 11 25 34v29c-7-4-14-6-25-6-9 0-17 2-23 6V46Z" fill={avatar.hair} />
          <circle cx="50" cy="43" r="22" fill={avatar.skin} />
          <path d="M29 38c5-19 36-25 44 2-14-4-29-13-44-2Z" fill={avatar.hair} />
          {avatar.style % 2 === 0 && <path d="M30 35c12-8 27-10 41 0" fill="none" stroke={avatar.accent} strokeWidth="4" strokeLinecap="round" />}
        </>
      ) : (
        <>
          <circle cx="50" cy="43" r="22" fill={avatar.skin} />
          <path d="M28 38c5-20 36-25 44 2-15-7-30-9-44-2Z" fill={avatar.hair} />
          <path d="M37 22c7-7 19-8 27 0-8 4-18 4-27 0Z" fill={avatar.accent} />
        </>
      )}
      <circle cx={42 - eyeOffset} cy="44" r="2.2" fill="#352923" />
      <circle cx={58 + eyeOffset} cy="44" r="2.2" fill="#352923" />
      <path d="M43 55c4 4 10 4 14 0" fill="none" stroke="#a45f54" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="33" cy="50" r="3" fill="#ed8f89" opacity=".35" />
      <circle cx="67" cy="50" r="3" fill="#ed8f89" opacity=".35" />
      <path d="M24 100c6-16 15-24 26-24s20 8 26 24" fill="none" stroke="#fff" strokeWidth="3" opacity=".35" />
    </svg>
  );
}

export default function ParticipantAvatar({
  participant,
  avatarId,
  className,
}) {
  const gender = participant?.gender || 'male';
  const selectedId = avatarId || participant?.avatar_id || getDefaultAvatarId(gender);
  const selected = PARTICIPANT_AVATARS.find(avatar => avatar.id === selectedId)
    || PARTICIPANT_AVATARS.find(avatar => avatar.id === getDefaultAvatarId(gender));
  return (
    <div className={cn('overflow-hidden rounded-full bg-muted', className)}>
      <IllustratedAvatar avatar={selected} />
    </div>
  );
}
