import { createSelector } from '@reduxjs/toolkit';
import {
  buildRecurringLinkMapByRecurringTransactionId,
  getLinkedRecurringTransactionId,
  isLinkActive,
} from '@/utils/linking';

export const selectRecurringTransactionLinks = (state) =>
  state.recurringTransactionLinks;

export const selectActiveRecurringTransactionLinks = createSelector(
  [selectRecurringTransactionLinks],
  (links) => links.filter(isLinkActive),
);

export const selectRecurringTransactionLinkByRecurringTransactionId =
  (recurringTransactionId) =>
    createSelector(
      [selectActiveRecurringTransactionLinks, () => recurringTransactionId],
      (links, id) =>
        links.find(
          (link) =>
            link.sourceRecurringTransactionId === id ||
            link.destinationRecurringTransactionId === id,
        ),
    );

export const selectLinkedRecurringTransactionId = (recurringTransactionId) =>
  createSelector(
    [
      selectRecurringTransactionLinkByRecurringTransactionId(
        recurringTransactionId,
      ),
      () => recurringTransactionId,
    ],
    (link, id) => getLinkedRecurringTransactionId(link, id),
  );

export const selectRecurringLinkMapByRecurringTransactionId = createSelector(
  [selectActiveRecurringTransactionLinks],
  (links) => buildRecurringLinkMapByRecurringTransactionId(links),
);
