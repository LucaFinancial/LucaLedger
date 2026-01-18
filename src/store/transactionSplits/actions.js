import { setTransactionSplitsForTransaction } from './slice';
import { generateTransactionSplit } from './generators';

export const saveTransactionSplits = (transactionId, splits) => (dispatch) => {
  const normalized = splits
    .map((split) =>
      generateTransactionSplit({
        ...split,
        transactionId,
      }),
    )
    .filter(Boolean);

  dispatch(
    setTransactionSplitsForTransaction({
      transactionId,
      splits: normalized,
    }),
  );
};
