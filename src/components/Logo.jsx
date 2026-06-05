import React from 'react';

export default function Logo({ className = "h-12 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue badge square */}
      <rect x="0" y="0" width="80" height="80" rx="14" fill="#1e3a8a"/>
      {/* Subtle Star of David lines */}
      <polygon points="40,12 48,26 32,26" fill="none" stroke="#fbbf2480" strokeWidth="1.5"/>
      <polygon points="40,68 48,54 32,54" fill="none" stroke="#fbbf2480" strokeWidth="1.5"/>
      {/* EJ monogram */}
      <text x="40" y="57" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="44" textAnchor="middle" fill="#fbbf24">EJ</text>
      {/* Wordmark */}
      <text x="100" y="38" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="26" fill="#1e3a8a">EnerJew</text>
      <text x="100" y="62" fontFamily="Arial, sans-serif" fontWeight="500" fontSize="19" fill="#92400e" letterSpacing="3">OMSK</text>
    </svg>
  );
}