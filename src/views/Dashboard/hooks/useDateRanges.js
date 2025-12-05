import { useMemo } from 'react';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  addDays,
} from 'date-fns';

/**
 * Custom hook to calculate date ranges for dashboard filtering
 * @returns {Object} Date ranges for filtering transactions
 */
export function useDateRanges() {
  return useMemo(() => {
    const today = new Date();
    return {
      today: startOfDay(today),
      todayEnd: endOfDay(today),
      currentMonthStart: startOfMonth(today),
      currentMonthEnd: endOfMonth(today),
      recentStart: subDays(today, 14),
      futureEnd: addDays(today, 30),
    };
  }, []);
}
