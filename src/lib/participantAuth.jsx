import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ParticipantAuthContext = createContext(null);
const DEVICE_KEY = 'enerjew_participant_device';

function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

async function findParticipantByName(name) {
  const normalized = normalizeName(name);
  const activeParticipants = await base44.entities.Participant.filter({ status: 'active' });
  return activeParticipants.find(
    participant => participant.full_name?.trim().toLowerCase() === normalized.toLowerCase()
  );
}

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

  const login = useCallback(async (nameOrId, pin) => {
    const byId = await base44.entities.Participant.filter({ id: nameOrId });
    const p = byId[0] || await findParticipantByName(nameOrId);
    if (!p) throw new Error('Участник не найден');

    if (p.status !== 'active') throw new Error('Аккаунт деактивирован');
    
    // Simple PIN check (in production, use hashing)
    if (p.pin_hash !== String(pin)) throw new Error('Неверный PIN');

    const deviceId = getDeviceId();
    if (p.device_id && p.device_id !== deviceId) {
      throw new Error('Этот аккаунт уже привязан к другому телефону. Попросите администратора сбросить телефон.');
    }

    let updatedParticipant = p;
    if (!p.device_id) {
      const update = {
        device_id: deviceId,
        device_registered_at: new Date().toISOString(),
      };
      updatedParticipant = await base44.entities.Participant.update(p.id, update) || { ...p, ...update };
    }
    
    setParticipant(updatedParticipant);
    localStorage.setItem('participant_session', JSON.stringify({ id: updatedParticipant.id }));
    return updatedParticipant;
  }, []);

  const registerParticipant = useCallback(async ({ fullName, gender, pin }) => {
    const normalizedName = normalizeName(fullName);
    if (normalizedName.length < 2) throw new Error('Введите имя');
    if (!gender) throw new Error('Выберите мальчик или девочка');
    if (!/^\d{4,6}$/.test(String(pin))) throw new Error('PIN должен быть из 4-6 цифр');

    const existing = await findParticipantByName(normalizedName);
    if (existing) throw new Error('Такое имя уже есть. Если это ты, войди с PIN.');

    const created = await base44.entities.Participant.create({
      full_name: normalizedName,
      gender,
      pin_hash: String(pin),
      status: 'active',
      mission_selected: false,
      onboarding_complete: false,
      progress_level: 'beginner',
      badges: [],
      device_id: getDeviceId(),
      device_registered_at: new Date().toISOString(),
    });

    setParticipant(created);
    localStorage.setItem('participant_session', JSON.stringify({ id: created.id }));
    return created;
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
    <ParticipantAuthContext.Provider value={{ participant, loading, login, registerParticipant, logout, refresh, setParticipant }}>
      {children}
    </ParticipantAuthContext.Provider>
  );
}

export function useParticipant() {
  const ctx = useContext(ParticipantAuthContext);
  if (!ctx) throw new Error('useParticipant must be inside ParticipantAuthProvider');
  return ctx;
}
