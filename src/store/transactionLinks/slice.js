import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';

const cleanTransactionLink = (transactionLink) => {
  try {
    return validateSchemaSync('transactionLink', transactionLink);
  } catch (error) {
    console.error('Invalid transaction link data:', error);
    return transactionLink;
  }
};

const transactionLinks = createSlice({
  name: 'transactionLinks',
  initialState: [],
  reducers: {
    setTransactionLinks: (_state, action) =>
      action.payload.map(cleanTransactionLink),
    addTransactionLink: (state, action) => {
      state.push(cleanTransactionLink(action.payload));
    },
    updateTransactionLink: (state, action) => {
      const updatedLink = cleanTransactionLink(action.payload);
      const index = state.findIndex((link) => link.id === updatedLink.id);
      if (index !== -1) {
        updatedLink.updatedAt = new Date().toISOString();
        state[index] = { ...state[index], ...updatedLink };
      }
    },
    removeTransactionLink: (state, action) =>
      state.filter((link) => link.id !== action.payload),
  },
});

export default transactionLinks.reducer;

export const {
  setTransactionLinks,
  addTransactionLink,
  updateTransactionLink,
  removeTransactionLink,
} = transactionLinks.actions;
