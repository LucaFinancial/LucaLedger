import { createSlice } from '@reduxjs/toolkit';
import { validateRecurringOccurrenceSync } from '@/validation/validator';

/**
 * Validates and cleans a recurring occurrence object
 * Removes any properties not defined in the schema
 */
const cleanRecurringOccurrence = (occurrence) => {
  try {
    return validateRecurringOccurrenceSync(occurrence);
  } catch (error) {
    console.error('Invalid recurring occurrence data:', error);
    // Return the occurrence as-is if validation fails
    // This prevents data loss but logs the issue
    return occurrence;
  }
};

const recurringOccurrences = createSlice({
  name: 'recurringOccurrences',
  initialState: [],
  reducers: {
    setRecurringOccurrences: (state, action) => {
      // Replace all recurring occurrences (used when loading from encrypted storage)
      // Validate and clean each occurrence
      return action.payload.map(cleanRecurringOccurrence);
    },
    addRecurringOccurrence: (state, action) => {
      state.push(cleanRecurringOccurrence(action.payload));
    },
    removeRecurringOccurrence: (state, action) => {
      const id = action.payload;
      return state.filter((occ) => occ.id !== id);
    },
    // Prune occurrences that are in the past (cleanup)
    pruneOldOccurrences: (state, action) => {
      const cutoffDate = action.payload; // Date string in YYYY/MM/DD format
      return state.filter((occ) => occ.originalDate >= cutoffDate);
    },
  },
});

export default recurringOccurrences.reducer;

export const {
  setRecurringOccurrences,
  addRecurringOccurrence,
  removeRecurringOccurrence,
  pruneOldOccurrences,
} = recurringOccurrences.actions;
