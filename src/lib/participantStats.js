import { base44 } from '@/api/base44Client';
import {
  DEFAULT_SETTINGS,
  calculateMissionProgress,
  canSubmitRetrospective,
  getEligibleDatesInRange,
  getOmskDate,
  getProgressLevel,
  isMitzvahEligibleOnDate,
  parseOmskDateTime,
} from '@/lib/campaign';

export async function getCampaignSetting(key) {
  const records = await base44.entities.CampaignSettings.filter({ key });
  const value = records[0]?.value;
  // Preserve existing settings, except for the original pre-launch date.
  if (key === 'campaign_start' && value === '2026-06-07') {
    return DEFAULT_SETTINGS.campaign_start;
  }
  return value ?? String(DEFAULT_SETTINGS[key] ?? '');
}

function getLastDateToCount(endDate) {
  const today = getOmskDate();
  return today < endDate ? today : endDate;
}

function calculateStreaks(eligibleDates, completedDates, retrospectiveProtectedDates = new Set()) {
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

  let currentStreak = 0;
  for (let index = eligibleDates.length - 1; index >= 0; index -= 1) {
    const date = eligibleDates[index];
    if (completedDates.has(date)) {
      currentStreak += 1;
    } else if (!retrospectiveProtectedDates.has(date)) {
      break;
    }
  }

  return { currentStreak, bestStreak };
}

function getRetrospectiveProtectedDates(closurePeriods, mitzvah, eligibleDateSet) {
  const dates = new Set();
  const now = new Date();

  closurePeriods.forEach(period => {
    const end = parseOmskDateTime(period.end_time);
    if (end >= now || !canSubmitRetrospective(period)) return;

    const current = parseOmskDateTime(period.start_time);
    while (current <= end) {
      const date = getOmskDate(current);
      if (eligibleDateSet.has(date) && isMitzvahEligibleOnDate(mitzvah, date)) {
        dates.add(date);
      }
      current.setDate(current.getDate() + 1);
    }
  });

  return dates;
}

export async function recalculateParticipantStats(participant, mitzvahOverride = null) {
  if (!participant?.id || !participant.main_mitzvah_id) return participant;

  const [
    mitzvahRecords,
    mainCheckIns,
    bonusCheckIns,
    adjustments,
    closurePeriods,
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
    base44.entities.ClosurePeriod.list('-end_time', 20),
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
  const retrospectiveProtectedDates = getRetrospectiveProtectedDates(closurePeriods, mitzvah, eligibleDateSet);
  const { currentStreak, bestStreak } = calculateStreaks(eligibleDates, completedDates, retrospectiveProtectedDates);
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
