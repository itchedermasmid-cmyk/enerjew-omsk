import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { isCurrentlyInClosure } from '@/lib/campaign';
import ParticipantLogin from '@/pages/ParticipantLogin';
import ShabbosScreen from '@/pages/ShabbosScreen';
import Onboarding from '@/components/participant/Onboarding';
import AvatarPickerScreen from '@/components/participant/AvatarPickerScreen';

export default function ParticipantGate({ children }) {
  const { participant, loading } = useParticipant();
  const [closurePeriods, setClosurePeriods] = useState([]);
  const [closureLoading, setClosureLoading] = useState(true);

  useEffect(() => {
    base44.entities.ClosurePeriod.list('-start_time', 100)
      .then(setClosurePeriods)
      .catch(() => setClosurePeriods([]))
      .finally(() => setClosureLoading(false));
  }, []);

  if (loading || closureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeClosure = isCurrentlyInClosure(closurePeriods);
  if (activeClosure) return <ShabbosScreen closurePeriod={activeClosure} />;
  if (!participant) return <ParticipantLogin />;
  if (!participant.onboarding_complete || !participant.mission_selected) return <Onboarding />;
  if (!participant.avatar_url) return <AvatarPickerScreen />;

  return children;
}