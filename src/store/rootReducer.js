import { combineReducers } from '@reduxjs/toolkit';

import { reducer as accountsLegacyReducer } from './accountsLegacy';

export default combineReducers({
  accountsLegacy: accountsLegacyReducer,
});
