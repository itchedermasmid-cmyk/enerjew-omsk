import { base44 } from '@/api/base44Client';
import { getOmskDate, isCurrentlyInClosure } from '@/lib/campaign';
import { getCampaignSetting } from '@/lib/participantStats';

export async function assertParticipantActionsOpen(eligibleDate = getOmskDate()) {
  const [closurePeriods, startDate, endDate] = await Promise.all([
    base44.entities.ClosurePeriod.list('-start_time', 100),
    getCampaignSetting('campaign_start'),
    getCampaignSetting('campaign_end'),
  ]);

  if (isCurrentlyInClosure(closurePeriods)) {
    throw new Error('Приложение закрыто на Шаббат');
  }

  if (eligibleDate < startDate || eligibleDate > endDate) {
    throw new Error('Отметки доступны только во время летней кампании');
  }
}

