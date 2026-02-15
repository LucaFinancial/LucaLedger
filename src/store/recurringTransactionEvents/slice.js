import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';

const CANONICAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLASH_DATE_PATTERN = /^(\d{4})\/(\d{2})\/(\d{2})$/;

const isValidDateParts = (year, month, day) => {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
};

const parseDateParts = (value, pattern) => {
  const match = value.match(pattern);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (!isValidDateParts(year, month, day)) return null;
  return { year, month, day };
};

const normalizeDateString = (value) => {
  if (typeof value !== 'string') return null;

  const canonicalParts = parseDateParts(value, CANONICAL_DATE_PATTERN);
  if (canonicalParts) return value;

  const slashParts = parseDateParts(value, SLASH_DATE_PATTERN);
  if (!slashParts) return null;

  return `${slashParts.year.toString().padStart(4, '0')}-${slashParts.month
    .toString()
    .padStart(2, '0')}-${slashParts.day.toString().padStart(2, '0')}`;
};

const cleanRecurringTransactionEvent = (event) => {
  try {
    return validateSchemaSync('recurringTransactionEvent', event);
  } catch (error) {
    console.error('Invalid recurring transaction event data:', error);
    return event;
  }
};

const recurringTransactionEvents = createSlice({
  name: 'recurringTransactionEvents',
  initialState: [],
  reducers: {
    setRecurringTransactionEvents: (state, action) =>
      action.payload.map(cleanRecurringTransactionEvent),
    addRecurringTransactionEvent: (state, action) => {
      state.push(cleanRecurringTransactionEvent(action.payload));
    },
    removeRecurringTransactionEvent: (state, action) =>
      state.filter((event) => event.id !== action.payload),
    pruneOldEvents: (state, action) => {
      const cutoffDate = action.payload;
      return state.filter((event) => {
        const normalizedExpectedDate = normalizeDateString(event.expectedDate);
        if (normalizedExpectedDate === null) {
          return true;
        }

        return normalizedExpectedDate >= cutoffDate;
      });
    },
  },
});

export default recurringTransactionEvents.reducer;

export const {
  setRecurringTransactionEvents,
  addRecurringTransactionEvent,
  removeRecurringTransactionEvent,
  pruneOldEvents,
} = recurringTransactionEvents.actions;
