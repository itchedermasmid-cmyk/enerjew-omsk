import React from 'react';

const palette = {
  'modeh-ani': ['#fff4d6', '#ffd36a'],
  'morning-washing': ['#e6f7ff', '#8bd7ff'],
  'morning-shema': ['#fff8d8', '#fbbf24'],
  'night-shema': ['#e9e8ff', '#7c83e8'],
  'bracha-food': ['#fff1df', '#f59e65'],
  tefillin: ['#e8f0ff', '#4f7fd8'],
  'shabbos-candles': ['#fff0dc', '#f9a23f'],
  davening: ['#edf4ff', '#75a8f8'],
  'torah-learning': ['#f3eaff', '#a77ce9'],
};

const symbols = {
  'morning-shema': 'שמע',
  'night-shema': 'שמע',
  'bracha-food': 'ברכה',
  tefillin: 'תפילין',
  'shabbos-candles': 'שבת',
  davening: 'תפילה',
  'torah-learning': 'תורה',
};

function MorningScene() {
  return (
    <>
      <circle cx="264" cy="54" r="29" fill="#fbbf24" opacity=".95" />
      <path d="M264 14v-14M264 108v-14M224 54h-14M318 54h-14M236 26l-10-10M302 92l-10-10M292 26l10-10M226 92l10-10" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
      <rect x="35" y="113" width="226" height="57" rx="16" fill="#fff" opacity=".92" />
      <rect x="48" y="96" width="85" height="33" rx="14" fill="#fff" />
      <path d="M54 158h194M63 171v16M235 171v16" stroke="#4169a8" strokeWidth="7" strokeLinecap="round" />
      <circle cx="105" cy="83" r="23" fill="#f4bd99" />
      <path d="M128 108c19 2 35 18 41 48h-82c1-29 17-47 41-48Z" fill="#5c8ee6" />
      <path d="M77 82c11-31 51-35 61 2-15-7-43-7-61-2Z" fill="#603d2d" />
      <path d="M103 88c4 4 9 4 13 0" stroke="#814d3c" strokeWidth="3" strokeLinecap="round" />
      <path d="M169 122c22 1 35-6 45-20" stroke="#f4bd99" strokeWidth="11" strokeLinecap="round" />
      <path d="M216 102l11-10M213 100l6-16M216 104l17-4" stroke="#f4bd99" strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function WashingScene() {
  return (
    <>
      <path d="M38 68h84c20 0 30 10 30 28v4" fill="none" stroke="#3b82c4" strokeWidth="14" strokeLinecap="round" />
      <path d="M81 67V45h38" fill="none" stroke="#3b82c4" strokeWidth="11" strokeLinecap="round" />
      <path d="M151 96c0 20-18 25-18 39 0 10 8 17 18 17s18-7 18-17c0-14-18-19-18-39Z" fill="#fff" opacity=".95" />
      <path d="M190 108c-9 17-18 33-24 54M220 113c-4 19-11 37-15 55M247 118c0 17-3 34-4 50" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
      <path d="M159 174c31-33 70-36 112-11M194 188c27-25 60-23 91-1" fill="none" stroke="#f4bd99" strokeWidth="16" strokeLinecap="round" />
      {['П', 'Л', 'П', 'Л', 'П', 'Л'].map((letter, index) => (
        <g key={`${letter}-${index}`}>
          <circle cx={42 + index * 43} cy="218" r="17" fill={index % 2 ? '#fff' : '#2176b5'} opacity={index % 2 ? '.92' : '1'} />
          <text x={42 + index * 43} y="224" textAnchor="middle" fontSize="16" fontWeight="700" fill={index % 2 ? '#2176b5' : '#fff'}>{letter}</text>
        </g>
      ))}
    </>
  );
}

function CandleScene() {
  return (
    <>
      <path d="M95 181h150" stroke="#b56b36" strokeWidth="11" strokeLinecap="round" />
      {[128, 212].map(x => (
        <g key={x}>
          <rect x={x - 17} y="90" width="34" height="88" rx="8" fill="#fffaf1" />
          <path d={`M${x} 91c-20-24 0-47 0-47s20 23 0 47Z`} fill="#f59e0b" />
          <path d={`M${x} 78c-7-11 0-22 0-22s7 11 0 22Z`} fill="#fff3a6" />
        </g>
      ))}
      <circle cx="266" cy="48" r="20" fill="#fff" opacity=".55" />
      <circle cx="51" cy="56" r="10" fill="#fff" opacity=".45" />
      <circle cx="280" cy="139" r="8" fill="#fff" opacity=".4" />
    </>
  );
}

function LearningScene({ slug }) {
  const isTorah = slug === 'torah-learning';
  return (
    <>
      <path d="M62 82c47-20 89-10 108 9v107c-28-17-67-20-108-5V82ZM278 82c-47-20-89-10-108 9v107c28-17 67-20 108-5V82Z" fill="#fff" opacity=".95" />
      <path d="M170 92v106" stroke="#c7d2e8" strokeWidth="5" />
      <path d="M87 111h59M87 134h59M87 157h48M195 111h58M195 134h58M195 157h45" stroke="#88a0ce" strokeWidth="7" strokeLinecap="round" opacity=".75" />
      <text x="170" y="60" textAnchor="middle" fontSize="31" fontWeight="700" fill="#315caa">{isTorah ? 'תורה' : symbols[slug]}</text>
    </>
  );
}

function FoodScene() {
  return (
    <>
      <ellipse cx="171" cy="180" rx="113" ry="31" fill="#fff" opacity=".8" />
      <path d="M93 161c0-41 28-68 74-68 43 0 74 27 74 68H93Z" fill="#f2a15f" />
      <path d="M111 143c18-13 101-14 113 0" fill="none" stroke="#ffd298" strokeWidth="9" strokeLinecap="round" />
      <circle cx="103" cy="70" r="25" fill="#e9504d" />
      <path d="M103 48c2-13 13-20 25-20" stroke="#4b8f56" strokeWidth="8" strokeLinecap="round" />
      <path d="M251 75c15-24 38-25 46-2-11 8-30 8-46 2Z" fill="#6cad58" />
      <text x="171" y="226" textAnchor="middle" fontSize="23" fontWeight="700" fill="#a64b28">ברכה</text>
    </>
  );
}

export default function ResourceArtwork({ slug, compact = false }) {
  const [start, end] = palette[slug] || ['#edf4ff', '#a9c8ff'];
  const height = compact ? 92 : 236;

  return (
    <svg
      viewBox="0 0 340 250"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Иллюстрация к инструкции"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`resource-${slug}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>
      <rect width="340" height="250" rx="20" fill={`url(#resource-${slug})`} />
      {slug === 'modeh-ani' && <MorningScene />}
      {slug === 'morning-washing' && <WashingScene />}
      {slug === 'shabbos-candles' && <CandleScene />}
      {slug === 'bracha-food' && <FoodScene />}
      {['morning-shema', 'night-shema', 'tefillin', 'davening', 'torah-learning'].includes(slug) && <LearningScene slug={slug} />}
    </svg>
  );
}

