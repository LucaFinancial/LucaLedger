import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import TransactionLinkReconciliationPanel from './TransactionLinkReconciliationPanel';
import { RESOLVABLE_TRANSACTION_LINK_REASONS } from './transactionLinkDialogHelpers';
import {
  actions as transactionLinkActions,
  selectors as transactionLinkSelectors,
} from '@/store/transactionLinks';
import {
  inferLinkIsSameSign,
  validateTransactionLinkCandidate,
} from '@/utils/linking';

export default function SelectedTransactionLinkDialog({
  open,
  onClose,
  sourceTransactionId,
  destinationTransactionId,
  onLinked = null,
}) {
  const dispatch = useDispatch();
  const accounts = useSelector(accountSelectors.selectAccounts);
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const transactionLinks = useSelector(
    transactionLinkSelectors.selectActiveTransactionLinks,
  );
  const sourceTransaction = useSelector(
    useMemo(
      () =>
        sourceTransactionId
          ? transactionSelectors.selectTransactionById(sourceTransactionId)
          : () => null,
      [sourceTransactionId],
    ),
  );
  const destinationTransaction = useSelector(
    useMemo(
      () =>
        destinationTransactionId
          ? transactionSelectors.selectTransactionById(destinationTransactionId)
          : () => null,
      [destinationTransactionId],
    ),
  );

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAbsoluteAmount, setSelectedAbsoluteAmount] = useState('');
  const [selectedIsSameSign, setSelectedIsSameSign] = useState(true);
  const [selectedTransactionState, setSelectedTransactionState] = useState('');
  const [sharedDescription, setSharedDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const splitCountsByTransactionId = useMemo(
    () =>
      transactionSplits.reduce((counts, split) => {
        counts.set(
          split.transactionId,
          (counts.get(split.transactionId) || 0) + 1,
        );
        return counts;
      }, new Map()),
    [transactionSplits],
  );

  const validation = useMemo(() => {
    const sourceHasSplits =
      (splitCountsByTransactionId.get(sourceTransaction?.id) || 0) > 0;
    const destinationHasSplits =
      (splitCountsByTransactionId.get(destinationTransaction?.id) || 0) > 0;

    return validateTransactionLinkCandidate({
      sourceTransaction,
      destinationTransaction,
      transactionLinks,
      sourceHasSplits,
      destinationHasSplits,
    });
  }, [
    destinationTransaction,
    sourceTransaction,
    splitCountsByTransactionId,
    transactionLinks,
  ]);

  const blockingReason =
    validation.valid || RESOLVABLE_TRANSACTION_LINK_REASONS.has(validation.reason)
      ? ''
      : validation.reason || '';

  useEffect(() => {
    if (!open || !sourceTransaction || !destinationTransaction) return;

    setSelectedDate(sourceTransaction.date ?? destinationTransaction.date ?? '');
    setSelectedAbsoluteAmount(
      String(
        Math.abs(sourceTransaction.amount ?? destinationTransaction.amount ?? 0),
      ),
    );
    setSelectedIsSameSign(
      inferLinkIsSameSign(
        sourceTransaction.amount ?? 0,
        destinationTransaction.amount ?? 0,
      ),
    );
    setSelectedTransactionState(
      sourceTransaction.transactionState ??
        destinationTransaction.transactionState ??
        '',
    );
    setSharedDescription(
      sourceTransaction.description ??
        destinationTransaction.description ??
        '',
    );
    setErrorMessage('');
  }, [destinationTransaction, open, sourceTransaction]);

  const handleSave = async () => {
    if (!sourceTransactionId || !destinationTransactionId) return;

    const result = await dispatch(
      transactionLinkActions.reconcileAndSaveTransactionLinkPair({
        sourceTransactionId,
        destinationTransactionId,
        reconciledDate: selectedDate || null,
        reconciledAbsoluteAmount:
          selectedAbsoluteAmount === ''
            ? null
            : Number.parseInt(selectedAbsoluteAmount, 10),
        reconciledIsSameSign: selectedIsSameSign,
        reconciledTransactionState: selectedTransactionState || null,
        reconciledDescription: sharedDescription,
      }),
    );

    if (!result?.valid) {
      setErrorMessage(result?.reason || 'Unable to link these transactions.');
      return;
    }

    onLinked?.(result.link);
    onClose();
  };

  const isSaveDisabled =
    !sourceTransaction ||
    !destinationTransaction ||
    Boolean(blockingReason);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Link Selected Transactions</DialogTitle>
      <DialogContent>
        {sourceTransaction && destinationTransaction ? (
          <TransactionLinkReconciliationPanel
            sourceTransaction={sourceTransaction}
            destinationTransaction={destinationTransaction}
            sourceAccountName={
              accountsById.get(sourceTransaction.accountId) || 'Unknown Account'
            }
            destinationAccountName={
              accountsById.get(destinationTransaction.accountId) ||
              'Unknown Account'
            }
            blockingReason={blockingReason}
            errorMessage={errorMessage}
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            selectedAbsoluteAmount={selectedAbsoluteAmount}
            onSelectedAbsoluteAmountChange={setSelectedAbsoluteAmount}
            selectedIsSameSign={selectedIsSameSign}
            onSelectedIsSameSignChange={setSelectedIsSameSign}
            selectedTransactionState={selectedTransactionState}
            onSelectedTransactionStateChange={setSelectedTransactionState}
            sharedDescription={sharedDescription}
            onSharedDescriptionChange={setSharedDescription}
          />
        ) : (
          <Alert severity='error'>
            Both selected transactions must still exist before they can be
            linked.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant='contained' disabled={isSaveDisabled}>
          Save Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
