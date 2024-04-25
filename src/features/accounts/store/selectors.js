import { createSelector } from '@reduxjs/toolkit';

import { selectors } from '@/store/entities';

export const selectAllAccounts = createSelector(
  selectors.selectEntitiesSlice,
  (entities) =>
    entities.entitiesList.filter((entity) => entity.entityType === 'ACCOUNT')
);
