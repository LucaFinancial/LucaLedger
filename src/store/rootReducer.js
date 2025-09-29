import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsReducer } from './accounts';
import { reducer as categoriesReducer } from './categories';

export default combineReducers({
  accounts: accountsReducer,
  categories: categoriesReducer,
});
