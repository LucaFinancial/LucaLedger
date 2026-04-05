import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';

const cleanRecurringTransactionLink = (recurringTransactionLink) => {
  try {
    return validateSchemaSync(
      'recurringTransactionLink',
      recurringTransactionLink,
    );
  } catch (error) {
    console.error('Invalid recurring transaction link data:', error);
    return recurringTransactionLink;
  }
};

const recurringTransactionLinks = createSlice({
  name: 'recurringTransactionLinks',
  initialState: [],
  reducers: {
    setRecurringTransactionLinks: (_state, action) =>
      action.payload.map(cleanRecurringTransactionLink),
    addRecurringTransactionLink: (state, action) => {
      state.push(cleanRecurringTransactionLink(action.payload));
    },
    updateRecurringTransactionLink: (state, action) => {
      const updatedLink = cleanRecurringTransactionLink(action.payload);
      const index = state.findIndex((link) => link.id === updatedLink.id);
      if (index !== -1) {
        updatedLink.updatedAt = new Date().toISOString();
        state[index] = { ...state[index], ...updatedLink };
      }
    },
    removeRecurringTransactionLink: (state, action) =>
      state.filter((link) => link.id !== action.payload),
  },
});

export default recurringTransactionLinks.reducer;

export const {
  setRecurringTransactionLinks,
  addRecurringTransactionLink,
  updateRecurringTransactionLink,
  removeRecurringTransactionLink,
} = recurringTransactionLinks.actions;
