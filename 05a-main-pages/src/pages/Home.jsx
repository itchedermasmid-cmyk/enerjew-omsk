import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/participantAuth.jsx';
import { isCurrentlyInClosure } from '@/lib/campaign';
import ParticipantLogin from './ParticipantLogin';
import ShabbosScreen from './ShabbosScreen';
import Onboarding from '@/components/participant/Onboarding';
import TodayScreen from './participant/TodayScreen';

export default function Home() {
  const { participant, loading } = useParticipant();
  const [closurePeriods, setClosurePeriods] = useState([]);
  const [closureLoading, setClosureLoading] = useState(true);

  useEffect(() => {
    base44.entities.ClosurePeriod.list('-start_time', 50)
      .then(periods => { setClosurePeriods(periods); })
      .finally(() => setClosureLoading(false));
  }, []);

  if (loading || closureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Check Shabbos closure for non-logged-in users too
  if (!participant) {
    const activeClosure = isCurrentlyInClosure(closurePeriods);
    if (activeClosure) {
      return <ShabbosScreen closurePeriod={activeClosure} />;
    }
    return <ParticipantLogin />;
  }

  // Check Shabbos closure for logged-in participants
  const activeClosure = isCurrentlyInClosure(closurePeriods);
  if (activeClosure) {
    return <ShabbosScreen closurePeriod={activeClosure} />;
  }

  // Onboarding
  if (!participant.onboarding_complete || !participant.mission_selected) {
    return <Onboarding />;
  }

  return <TodayScreen />;
}