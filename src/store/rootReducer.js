import { combineReducers } from '@reduxjs/toolkit';

import categories from './categories';
import entities from './entities';
import recurringTransactions from './recurringTransactions';
import recurringTransactionEvents from './recurringTransactionEvents';
import transactions from './transactions';

export default combineReducers({
  categories,
  entities,
  recurringTransactions,
  recurringTransactionEvents,
  transactions,
});
