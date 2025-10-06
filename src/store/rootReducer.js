import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsLegacyReducer } from './accountsLegacy';
import { reducer as accountsReducer } from './accounts';
import { reducer as transactionsReducer } from './transactions';

export default combineReducers({
  accountsLegacy: accountsLegacyReducer,
  accounts: accountsReducer,
  transactions: transactionsReducer,
});
