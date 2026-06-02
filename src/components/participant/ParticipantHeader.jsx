import React from 'react';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { Link } from 'react-router-dom';
import ParticipantAvatar from '@/components/participant/ParticipantAvatar';

export default function ParticipantHeader({ title }) {
  const { participant } = useParticipant();
  const displayName = participant?.nickname || participant?.full_name?.split(' ')[0] || '';

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div>
          <h1 className="text-lg font-display font-bold text-foreground">{title}</h1>
        </div>
        
        <Link
          to="/profile"
          aria-label={`Открыть профиль: ${displayName}`}
          className="rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <ParticipantAvatar participant={participant} className="w-10 h-10 border-2 border-primary/15 shadow-sm" />
        </Link>
      </div>
    </header>
  );
}
