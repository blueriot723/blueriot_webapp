// Date Utils - Date manipulation and formatting

import { format, parse, addDays, subDays, isAfter, isBefore, differenceInDays } from 'date-fns';

/**
 * Format date for API calls (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateForAPI(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Parse date string
 * @param {string} dateString - YYYY-MM-DD
 * @returns {Date}
 */
export function parseDate(dateString) {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

/**
 * Get date range for weather forecast
 * @param {Date} startDate
 * @param {number} days - Number of days to forecast
 * @returns {string[]} - Array of YYYY-MM-DD strings
 */
export function getDateRange(startDate, days = 7) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    dates.push(formatDateForAPI(date));
  }
  return dates;
}

/**
 * Check if date is in the future
 * @param {Date|string} date
 * @returns {boolean}
 */
export function isFutureDate(date) {
  const d = typeof date === 'string' ? parseDate(date) : date;
  return isAfter(d, new Date());
}

/**
 * Check if date is in the past
 * @param {Date|string} date
 * @returns {boolean}
 */
export function isPastDate(date) {
  const d = typeof date === 'string' ? parseDate(date) : date;
  return isBefore(d, subDays(new Date(), 1));
}

/**
 * Calculate days between two dates
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
export function daysBetween(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  return differenceInDays(d2, d1);
}

/**
 * Get today's date string
 * @returns {string} - YYYY-MM-DD
 */
export function getToday() {
  return formatDateForAPI(new Date());
}

/**
 * Add days to a date
 * @param {Date|string} date
 * @param {number} days
 * @returns {string} - YYYY-MM-DD
 */
export function addDaysToDate(date, days) {
  const d = typeof date === 'string' ? parseDate(date) : date;
  return formatDateForAPI(addDays(d, days));
}

/**
 * Subtract days from a date
 * @param {Date|string} date
 * @param {number} days
 * @returns {string} - YYYY-MM-DD
 */
export function subtractDaysFromDate(date, days) {
  const d = typeof date === 'string' ? parseDate(date) : date;
  return formatDateForAPI(subDays(d, days));
}
