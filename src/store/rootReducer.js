import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsReducer } from './accounts';
import { reducer as transactionsReducer } from './transactions';
import { reducer as categoriesReducer } from './categories';
import encryptionReducer from './encryption';

export default combineReducers({
  accounts: accountsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  encryption: encryptionReducer,
});
