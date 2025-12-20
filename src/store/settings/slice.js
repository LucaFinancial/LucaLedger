import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_PROJECTION = { amount: 15, unit: 'months' };

const loadSettings = () => {
  try {
    const stored = localStorage.getItem('lucaLedgerSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure structure is correct (migration for future)
      return {
        recurringProjection: parsed.recurringProjection || DEFAULT_PROJECTION,
        ...parsed,
      };
    }
    return { recurringProjection: DEFAULT_PROJECTION };
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e);
    return { recurringProjection: DEFAULT_PROJECTION };
  }
};

const initialState = loadSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setRecurringProjection: (state, action) => {
      state.recurringProjection = action.payload;
      // Side effect in reducer for simplicity in this context
      localStorage.setItem('lucaLedgerSettings', JSON.stringify(state));
    },
  },
});

export const { setRecurringProjection } = settingsSlice.actions;
export default settingsSlice.reducer;
