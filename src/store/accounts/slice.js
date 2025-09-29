import { createSlice } from '@reduxjs/toolkit';

import {
  addAccountReducer,
  extraReducers,
  removeAccountReducer,
  updateAccountReducer,
} from './reducers';

const accounts = createSlice({
  name: 'accounts',
  initialState: [],
  reducers: {
    addAccount: addAccountReducer,
    removeAccount: removeAccountReducer,
    updateAccount: updateAccountReducer,
  },
  extraReducers,
});

export default accounts.reducer;

export const { addAccount, removeAccount, updateAccount } = accounts.actions;
