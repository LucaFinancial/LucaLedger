import { useMemo } from 'react';
import dayjs from 'dayjs';

/**
 * Custom hook to calculate date ranges for dashboard filtering
 * @returns {Object} Date ranges for filtering transactions
 */
export function useDateRanges() {
  return useMemo(() => {
    const today = dayjs();
    return {
      today,
      todayEnd: today.endOf('day'),
      currentMonthStart: today.startOf('month'),
      currentMonthEnd: today.endOf('month'),
      recentStart: today.subtract(14, 'day'),
      futureEnd: today.add(30, 'day'),
    };
  }, []);
}
