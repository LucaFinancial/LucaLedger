import { createSelector } from '@reduxjs/toolkit';

export const selectAllAccounts = createSelector(
  selectors.selectEntitiesSlice,
  (entities) =>
    entities.entitiesList.filter((entity) => entity.entityType === 'ACCOUNT')
);
