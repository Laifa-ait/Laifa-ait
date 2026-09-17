import { UnavailableRange } from './ShortTermBookingCalendar';

export function isDateInPast(dateStr: string, todayStr: string): boolean {
  return dateStr < todayStr;
}

export function isDateBooked(dateStr: string, unavailableRanges: UnavailableRange[]): boolean {
  return unavailableRanges.some((r) => dateStr >= r.startDate && dateStr < r.endDate);
}

export function checkDateDisabled(
  dateStr: string,
  todayStr: string,
  unavailableRanges: UnavailableRange[]
): boolean {
  return isDateInPast(dateStr, todayStr) || isDateBooked(dateStr, unavailableRanges);
}

export function resolveDateSelection(
  dateStr: string,
  startDate: string,
  endDate: string,
  isDateDisabled: (d: string) => boolean
): { newStartDate: string; newEndDate: string } {
  if (isDateDisabled(dateStr)) {
    return { newStartDate: startDate, newEndDate: endDate };
  }

  if (!startDate || (startDate && endDate)) {
    return { newStartDate: dateStr, newEndDate: '' };
  }

  if (dateStr <= startDate) {
    return { newStartDate: dateStr, newEndDate: '' };
  }

  const curr = new Date(startDate);
  const end = new Date(dateStr);
  let hasBlockedInBetween = false;
  let safetyDays = 0;

  while (curr < end && safetyDays < 366) {
    safetyDays++;
    const currStr = curr.toISOString().split('T')[0];
    if (isDateDisabled(currStr)) {
      hasBlockedInBetween = true;
      break;
    }
    curr.setDate(curr.getDate() + 1);
  }

  if (hasBlockedInBetween) {
    return { newStartDate: dateStr, newEndDate: '' };
  }

  return { newStartDate: startDate, newEndDate: dateStr };
}
