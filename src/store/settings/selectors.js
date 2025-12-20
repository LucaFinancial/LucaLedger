import { createSelector } from '@reduxjs/toolkit';

const selectSettings = (state) => state.settings;

export const selectRecurringProjection = createSelector(
  selectSettings,
  (settings) => settings.recurringProjection
);
