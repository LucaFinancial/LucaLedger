import { createSelector } from '@reduxjs/toolkit';

export const selectRecurringTransactionEvents = (state) =>
  state.recurringTransactionEvents;

export const selectEventsByRecurringTransactionId = (recurringTransactionId) =>
  createSelector(
    [selectRecurringTransactionEvents, () => recurringTransactionId],
    (events, id) =>
      events.filter((event) => event.recurringTransactionId === id),
  );

export const selectEventByRuleAndDate = (recurringTransactionId, date) =>
  createSelector(
    [
      selectRecurringTransactionEvents,
      () => recurringTransactionId,
      () => date,
    ],
    (events, rtId, dateStr) =>
      events.find(
        (event) =>
          event.recurringTransactionId === rtId &&
          event.expectedDate === dateStr,
      ),
  );

export const selectRealizedDatesForRecurringTransaction = (
  recurringTransactionId,
) =>
  createSelector(
    [selectRecurringTransactionEvents, () => recurringTransactionId],
    (events, rtId) => {
      const dates = new Set();
      events
        .filter(
          (event) =>
            event.recurringTransactionId === rtId &&
            event.eventState === 'MODIFIED' &&
            event.transactionId,
        )
        .forEach((event) => dates.add(event.expectedDate));
      return dates;
    },
  );

export const selectAllRealizedDatesMap = createSelector(
  [selectRecurringTransactionEvents],
  (events) => {
    const map = new Map();
    events
      .filter((event) => event.eventState === 'MODIFIED' && event.transactionId)
      .forEach((event) => {
        const key = `${event.recurringTransactionId}:${event.expectedDate}`;
        map.set(key, event.transactionId);
      });
    return map;
  },
);
