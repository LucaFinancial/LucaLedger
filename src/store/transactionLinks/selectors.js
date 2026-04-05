import { createSelector } from '@reduxjs/toolkit';
import {
  buildTransactionLinkMapByTransactionId,
  getLinkedTransactionId,
  isLinkActive,
} from '@/utils/linking';

export const selectTransactionLinks = (state) => state.transactionLinks;

export const selectActiveTransactionLinks = createSelector(
  [selectTransactionLinks],
  (transactionLinks) => transactionLinks.filter(isLinkActive),
);

export const selectTransactionLinkByTransactionId = (transactionId) =>
  createSelector([selectActiveTransactionLinks, () => transactionId], (links, id) =>
    links.find(
      (link) =>
        link.sourceTransactionId === id || link.destinationTransactionId === id,
    ),
  );

export const selectLinkedTransactionId = (transactionId) =>
  createSelector(
    [selectTransactionLinkByTransactionId(transactionId), () => transactionId],
    (link, id) => getLinkedTransactionId(link, id),
  );

export const selectTransactionLinkMapByTransactionId = createSelector(
  [selectActiveTransactionLinks],
  (links) => buildTransactionLinkMapByTransactionId(links),
);
