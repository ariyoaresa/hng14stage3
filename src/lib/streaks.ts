export function calculateCurrentStreak(completions: string[], today?: string): number {
  if (!completions || completions.length === 0) return 0;

  const todayStr = today || new Date().toISOString().split('T')[0];
  const uniqueDates = new Set(completions);
  
  if (!uniqueDates.has(todayStr)) {
    return 0;
  }

  let streak = 0;
  // Parse YYYY-MM-DD into UTC Date object to avoid timezone shifts
  const [y, m, d] = todayStr.split('-').map(Number);
  let currentDate = new Date(Date.UTC(y, m - 1, d));

  while (uniqueDates.has(currentDate.toISOString().split('T')[0])) {
    streak++;
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }

  return streak;
}
