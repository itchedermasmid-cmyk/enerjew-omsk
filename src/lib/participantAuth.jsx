import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ParticipantAuthContext = createContext(null);

export function ParticipantAuthProvider({ children }) {
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('participant_session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Refresh participant data from DB
        base44.entities.Participant.filter({ id: data.id })
          .then(results => {
            if (results.length > 0 && results[0].status === 'active') {
              setParticipant(results[0]);
            } else {
              localStorage.removeItem('participant_session');
            }
          })
          .catch(() => localStorage.removeItem('participant_session'))
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem('participant_session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (participantId, pin) => {
    const results = await base44.entities.Participant.filter({ id: participantId });
    if (results.length === 0) throw new Error('Участник не найден');
    
    const p = results[0];
    if (p.status !== 'active') throw new Error('Аккаунт деактивирован');
    
    // Simple PIN check (in production, use hashing)
    if (p.pin_hash !== String(pin)) throw new Error('Неверный PIN');
    
    setParticipant(p);
    localStorage.setItem('participant_session', JSON.stringify({ id: p.id }));
    return p;
  }, []);

  const logout = useCallback(() => {
    setParticipant(null);
    localStorage.removeItem('participant_session');
  }, []);

  const refresh = useCallback(async () => {
    if (!participant) return;
    const results = await base44.entities.Participant.filter({ id: participant.id });
    if (results.length > 0) {
      setParticipant(results[0]);
    }
  }, [participant]);

  return (
    <ParticipantAuthContext.Provider value={{ participant, loading, login, logout, refresh, setParticipant }}>
      {children}
    </ParticipantAuthContext.Provider>
  );
}

export function useParticipant() {
  const ctx = useContext(ParticipantAuthContext);
  if (!ctx) throw new Error('useParticipant must be inside ParticipantAuthProvider');
  return ctx;
}