import { createSlice } from '@reduxjs/toolkit';

import {
  addAccountReducer,
  extraReducers,
  removeAccountReducer,
  updateAccountReducer,
} from './reducers';

const accountsLegacy = createSlice({
  name: 'accountsLegacy',
  initialState: [],
  reducers: {
    addAccount: addAccountReducer,
    removeAccount: removeAccountReducer,
    updateAccount: updateAccountReducer,
  },
  extraReducers,
});

export default accountsLegacy.reducer;

export const { addAccount, removeAccount, updateAccount } =
  accountsLegacy.actions;
