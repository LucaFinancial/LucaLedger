import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsReducer } from './accounts';
import { reducer as transactionsReducer } from './transactions';

export default combineReducers({
  accounts: accountsReducer,
  transactions: transactionsReducer,
});
