import { createSelector } from '@reduxjs/toolkit';

export const selectEntitiesSlice = (state) => state.entities;

export const selectAllEntities = createSelector(
  selectEntitiesSlice,
  (entities) => entities.entitiesList
);

export const selectEntityById = (entityId) =>
  createSelector(selectEntitiesSlice, (entities) =>
    entities.entitiesList.find((entity) => entity.id === entityId)
  );
