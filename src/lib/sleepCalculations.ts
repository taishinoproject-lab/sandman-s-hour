import { PrepTask, Settings, NightState } from './storage';

/**
 * Parse time string "HH:MM" to minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to "HH:MM" format
 */
export function minutesToTime(minutes: number): string {
  // Handle negative and overflow
  let normalizedMinutes = minutes % (24 * 60);
  if (normalizedMinutes < 0) normalizedMinutes += 24 * 60;
  
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate total prep time from enabled tasks
 */
export function calculatePrepMinutes(tasks: PrepTask[]): number {
  return tasks
    .filter(task => task.enabled)
    .reduce((sum, task) => sum + task.minutes, 0);
}

/**
 * Calculate ideal bedtime
 * idealBedTime = wakeTime - targetSleepMin
 */
export function calculateIdealBedTime(wakeTime: string, targetSleepMin: number): string {
  const wakeMinutes = timeToMinutes(wakeTime);
  let bedMinutes = wakeMinutes - targetSleepMin;
  return minutesToTime(bedMinutes);
}

/**
 * Calculate night mode start time (when prep should begin)
 * nightModeStart = idealBedTime - prepMin
 * Clamped to 21:30 - 23:30 range
 */
export function calculateNightModeStart(
  wakeTime: string,
  targetSleepMin: number,
  prepMin: number
): string {
  const wakeMinutes = timeToMinutes(wakeTime);
  let nightStartMinutes = wakeMinutes - targetSleepMin - prepMin;
  
  // Normalize to handle crossing midnight
  if (nightStartMinutes < 0) nightStartMinutes += 24 * 60;
  
  // Clamp to 21:30 (1290) - 23:30 (1410) range
  const minClamp = 21 * 60 + 30; // 21:30
  const maxClamp = 23 * 60 + 30; // 23:30
  
  nightStartMinutes = Math.max(minClamp, Math.min(maxClamp, nightStartMinutes));
  
  return minutesToTime(nightStartMinutes);
}

/**
 * Calculate lost sleep minutes based on current time
 * lostSleepMin = max(0, (now + prepMin) - idealBedTime)
 */
export function calculateLostSleepMinutes(
  now: Date,
  idealBedTime: string,
  prepMin: number
): number {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const idealBedMinutes = timeToMinutes(idealBedTime);
  
  // Handle crossing midnight
  let adjustedIdealBedMinutes = idealBedMinutes;
  let adjustedNowMinutes = nowMinutes;
  
  // If ideal bedtime is before midnight and now is after, adjust
  if (idealBedMinutes > 12 * 60 && nowMinutes < 12 * 60) {
    adjustedNowMinutes += 24 * 60;
  }
  
  const projectedSleepStart = adjustedNowMinutes + prepMin;
  const lostMinutes = projectedSleepStart - adjustedIdealBedMinutes;
  
  return Math.max(0, lostMinutes);
}

/**
 * Calculate when sleep will actually start if prep begins now
 */
export function calculateActualSleepTime(now: Date, prepMin: number): string {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const sleepMinutes = nowMinutes + prepMin;
  return minutesToTime(sleepMinutes);
}

/**
 * Check if we should be in night mode
 */
export function isNightModeTime(now: Date, nightModeStart: string): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nightStartMinutes = timeToMinutes(nightModeStart);
  
  // Night mode: from nightModeStart until ~4:00 AM
  const earlyMorningEnd = 4 * 60; // 4:00 AM
  
  if (nightStartMinutes > earlyMorningEnd) {
    // Normal case: night mode starts in evening
    return nowMinutes >= nightStartMinutes || nowMinutes < earlyMorningEnd;
  }
  
  return nowMinutes >= nightStartMinutes && nowMinutes < earlyMorningEnd;
}

/**
 * Calculate prep end time
 */
export function calculatePrepEndTime(prepStartedAt: Date, prepMin: number): Date {
  return new Date(prepStartedAt.getTime() + prepMin * 60 * 1000);
}

/**
 * Check if prep is complete
 */
export function isPrepComplete(nightState: NightState, prepMin: number): boolean {
  if (!nightState.prepStartedAt) return false;
  const prepEnd = calculatePrepEndTime(new Date(nightState.prepStartedAt), prepMin);
  return new Date() >= prepEnd;
}

/**
 * Format time difference in a human-readable way
 */
export function formatTimeDiff(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}時間`;
  }
  return `${hours}時間${mins}分`;
}
