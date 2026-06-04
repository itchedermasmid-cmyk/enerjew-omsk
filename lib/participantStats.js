import { base44 } from '@/api/base44Client';
import {
  DEFAULT_SETTINGS,
  calculateMissionProgress,
  getEligibleDatesInRange,
  getOmskDate,
  getProgressLevel,
  isMitzvahEligibleOnDate,
} from '@/lib/campaign';

export async function getCampaignSetting(key) {
  const records = await base44.entities.CampaignSettings.filter({ key });
  return records[0]?.value ?? String(DEFAULT_SETTINGS[key] ?? '');
}

function getLastDateToCount(endDate) {
  const today = getOmskDate();
  return today < endDate ? today : endDate;
}

function calculateStreaks(eligibleDates, completedDates) {
  let bestStreak = 0;
  let runningStreak = 0;

  eligibleDates.forEach(date => {
    if (completedDates.has(date)) {
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  });

  return { currentStreak: runningStreak, bestStreak };
}

export async function recalculateParticipantStats(participant, mitzvahOverride = null) {
  if (!participant?.id || !participant.main_mitzvah_id) return participant;

  const [
    mitzvahRecords,
    mainCheckIns,
    bonusCheckIns,
    adjustments,
    startDate,
    endDate,
    prizeMissionThreshold,
    prizeBonusThreshold,
  ] = await Promise.all([
    mitzvahOverride
      ? Promise.resolve([mitzvahOverride])
      : base44.entities.Mitzvah.filter({ id: participant.main_mitzvah_id }),
    base44.entities.MainCheckIn.filter({ participant_id: participant.id, is_valid: true }),
    base44.entities.BonusCheckIn.filter({ participant_id: participant.id, is_valid: true }),
    base44.entities.BonusStarAdjustment.filter({ participant_id: participant.id }),
    getCampaignSetting('campaign_start'),
    getCampaignSetting('campaign_end'),
    getCampaignSetting('special_prize_mission_threshold'),
    getCampaignSetting('special_prize_bonus_threshold'),
  ]);

  const mitzvah = mitzvahRecords[0];
  if (!mitzvah) return participant;

  const eligibleDates = getEligibleDatesInRange(mitzvah, startDate, getLastDateToCount(endDate));
  const eligibleDateSet = new Set(eligibleDates);
  const completedDates = new Set(
    mainCheckIns
      .filter(checkIn =>
        checkIn.mitzvah_id === participant.main_mitzvah_id &&
        eligibleDateSet.has(checkIn.eligible_date) &&
        isMitzvahEligibleOnDate(mitzvah, checkIn.eligible_date)
      )
      .map(checkIn => checkIn.eligible_date)
  );

  const completed = completedDates.size;
  const progress = calculateMissionProgress(completed, eligibleDates.length);
  const { currentStreak, bestStreak } = calculateStreaks(eligibleDates, completedDates);
  const regularBonusStars = bonusCheckIns.reduce((sum, checkIn) => sum + (checkIn.stars_awarded || 1), 0);
  const adjustedBonusStars = adjustments.reduce((sum, adjustment) => sum + (adjustment.stars_change || 0), 0);
  const bonusStars = Math.max(0, regularBonusStars + adjustedBonusStars);
  const specialPrize = progress >= Number(prizeMissionThreshold) && bonusStars >= Number(prizeBonusThreshold);

  const update = {
    completed_eligible: completed,
    eligible_so_far: eligibleDates.length,
    mission_progress: progress,
    progress_level: getProgressLevel(progress),
    current_streak: currentStreak,
    best_streak: Math.max(participant.best_streak || 0, bestStreak),
    bonus_stars: bonusStars,
    special_prize_earned: specialPrize,
  };

  await base44.entities.Participant.update(participant.id, update);
  return { ...participant, ...update };
}

