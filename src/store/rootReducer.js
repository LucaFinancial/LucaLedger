import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsReducer } from './accounts';
import { reducer as transactionsReducer } from './transactions';
import { reducer as categoriesReducer } from './categories';
import { reducer as statementsReducer } from './statements';
import { reducer as recurringTransactionsReducer } from './recurringTransactions';
import { reducer as recurringTransactionEventsReducer } from './recurringTransactionEvents';
import { reducer as transactionSplitsReducer } from './transactionSplits';
import { reducer as settingsReducer } from './settings';
import encryptionReducer from './encryption';

export default combineReducers({
  accounts: accountsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  statements: statementsReducer,
  recurringTransactions: recurringTransactionsReducer,
  recurringTransactionEvents: recurringTransactionEventsReducer,
  transactionSplits: transactionSplitsReducer,
  settings: settingsReducer,
  encryption: encryptionReducer,
});
