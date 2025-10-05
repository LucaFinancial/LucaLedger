import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsReducer } from './accounts';

export default combineReducers({
  accountsLegacy: accountsReducer,
});
