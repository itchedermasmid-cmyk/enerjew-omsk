// Campaign utility functions
// All dates use Asia/Omsk timezone (UTC+6)

const OMSK_OFFSET_HOURS = 6;

export function getOmskNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + OMSK_OFFSET_HOURS * 3600000);
}

export function getOmskDate() {
  return formatDateString(getOmskNow());
}

export function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDayOfWeek(dateStr) {
  return parseDate(dateStr).getDay(); // 0=Sun..6=Sat
}

export function isMitzvahEligibleOnDate(mitzvah, dateStr) {
  if (!mitzvah || !mitzvah.is_active) return false;
  
  const dayOfWeek = getDayOfWeek(dateStr);
  
  if (mitzvah.frequency === 'daily') return true;
  if (mitzvah.frequency === 'weekdays_only') return dayOfWeek >= 0 && dayOfWeek <= 4; // Sun-Thu (no Fri/Sat for tefillin)
  if (mitzvah.frequency === 'shabbos_only') return dayOfWeek === 5; // Friday for candle lighting
  if (mitzvah.frequency === 'custom' && mitzvah.eligible_days?.length > 0) {
    return mitzvah.eligible_days.includes(dayOfWeek);
  }
  return true;
}

export function isMitzvahEligibleForGender(mitzvah, gender) {
  if (!mitzvah) return false;
  if (mitzvah.eligibility === 'all') return true;
  if (mitzvah.eligibility === 'boys_only' && gender === 'male') return true;
  if (mitzvah.eligibility === 'girls_only' && gender === 'female') return true;
  return false;
}

export function calculateMissionProgress(completed, eligible) {
  if (eligible <= 0) return 0;
  return Math.round((completed / eligible) * 100);
}

export function getProgressLevel(progress) {
  if (progress >= 100) return 'summer_champion';
  if (progress >= 80) return 'trip_qualified';
  if (progress >= 50) return 'halfway_hero';
  if (progress >= 25) return 'strong_start';
  return 'beginner';
}

export function getProgressLevelName(level) {
  const names = {
    beginner: 'Начало пути',
    strong_start: 'Уверенный старт',
    halfway_hero: 'Герой на полпути',
    trip_qualified: 'Поездка заслужена!',
    summer_champion: 'Чемпион лета!'
  };
  return names[level] || level;
}

export function getEligibleDatesInRange(mitzvah, startDate, endDate) {
  const dates = [];
  const current = parseDate(startDate);
  const end = parseDate(endDate);
  
  while (current <= end) {
    const dateStr = formatDateString(current);
    if (isMitzvahEligibleOnDate(mitzvah, dateStr)) {
      dates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isCurrentlyInClosure(closurePeriods) {
  const now = getOmskNow();
  const nowMs = now.getTime();
  
  for (const period of closurePeriods) {
    const start = new Date(period.start_time).getTime();
    const end = new Date(period.end_time).getTime();
    if (nowMs >= start && nowMs <= end) {
      return period;
    }
  }
  return null;
}

export function getNextClosureEnd(closurePeriod) {
  if (!closurePeriod) return null;
  return new Date(closurePeriod.end_time);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateRu(dateStr) {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short'
  });
}

export function canSubmitRetrospective(closurePeriod) {
  if (!closurePeriod) return false;
  const now = getOmskNow();
  const deadline = closurePeriod.retrospective_deadline
    ? new Date(closurePeriod.retrospective_deadline)
    : null;
  
  if (!deadline) {
    // Default: Sunday 23:59 after the closure ends
    const end = new Date(closurePeriod.end_time);
    const sunday = new Date(end);
    sunday.setDate(sunday.getDate() + (7 - sunday.getDay()) % 7);
    sunday.setHours(23, 59, 59, 999);
    return now <= sunday;
  }
  return now <= deadline;
}

export const MILESTONE_THRESHOLDS = {
  strong_start: 25,
  halfway_hero: 50,
  trip_qualified: 80,
  summer_champion: 100
};

export const DEFAULT_SETTINGS = {
  campaign_year: '2025',
  campaign_start: '2025-06-07',
  campaign_end: '2025-08-31',
  timezone: 'Asia/Omsk',
  max_daily_bonus: 3,
  retro_deadline_day: 'sunday',
  retro_deadline_time: '23:59',
  special_prize_mission_threshold: 80,
  special_prize_bonus_threshold: 100,
  hide_exact_percentages: false,
  allow_mission_change: false
};