import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TransactionLinkReconciliationPanel from './TransactionLinkReconciliationPanel';
import {
  formatTransactionLinkCurrency,
  formatTransactionLinkDateLabel,
  getTransactionDateDistanceInDays,
  RESOLVABLE_TRANSACTION_LINK_REASONS,
  TRANSACTION_NEAR_MATCH_DAY_WINDOW,
} from './transactionLinkDialogHelpers';
import {
  actions as transactionLinkActions,
  selectors as transactionLinkSelectors,
} from '@/store/transactionLinks';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { validateTransactionLinkCandidate } from '@/utils/linking';

export default function TransactionLinkDialog({
  open,
  onClose,
  sourceTransactionId,
  preselectedTransactionId = null,
  onLinked = null,
}) {
  const dispatch = useDispatch();
  const accounts = useSelector(accountSelectors.selectAccounts);
  const transactions = useSelector(transactionSelectors.selectTransactions);
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const activeTransactionLinks = useSelector(
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
  const sourceTransactionLink = useSelector(
    useMemo(
      () =>
        sourceTransactionId
          ? transactionLinkSelectors.selectTransactionLinkByTransactionId(
              sourceTransactionId,
            )
          : () => null,
      [sourceTransactionId],
    ),
  );

  const [search, setSearch] = useState('');
  const [showIneligible, setShowIneligible] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAbsoluteAmount, setSelectedAbsoluteAmount] = useState('');
  const [selectedTransactionState, setSelectedTransactionState] = useState('');
  const [syncDescription, setSyncDescription] = useState(false);
  const [sharedDescription, setSharedDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );
  const transactionSplitCounts = useMemo(
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

  useEffect(() => {
    if (!open) return;

    const currentLinkedTargetId =
      sourceTransactionLink?.sourceTransactionId === sourceTransactionId
        ? sourceTransactionLink.destinationTransactionId
        : sourceTransactionLink?.destinationTransactionId || '';

    setSearch('');
    setShowIneligible(false);
    setSelectedTargetId(preselectedTransactionId || currentLinkedTargetId || '');
    setErrorMessage('');
  }, [open, preselectedTransactionId, sourceTransactionId, sourceTransactionLink]);

  const candidateRows = useMemo(() => {
    if (!sourceTransaction) return [];

    const sourceHasSplits =
      (transactionSplitCounts.get(sourceTransaction.id) || 0) > 0;
    const linksForValidation = activeTransactionLinks.filter(
      (link) => link.id !== sourceTransactionLink?.id,
    );

    return transactions
      .filter(
        (transaction) =>
          transaction.id !== sourceTransaction.id &&
          transaction.accountId !== sourceTransaction.accountId,
      )
      .map((transaction) => {
        const targetHasSplits =
          (transactionSplitCounts.get(transaction.id) || 0) > 0;
        const validation = validateTransactionLinkCandidate({
          sourceTransaction,
          destinationTransaction: transaction,
          transactionLinks: linksForValidation,
          sourceHasSplits,
          destinationHasSplits: targetHasSplits,
        });
        const dayDistance = getTransactionDateDistanceInDays(
          sourceTransaction.date,
          transaction.date,
        );
        const exactAmountMatch =
          Math.abs(transaction.amount) === Math.abs(sourceTransaction.amount);
        const exactDateMatch = dayDistance === 0;
        const nearDateMatch = dayDistance <= TRANSACTION_NEAR_MATCH_DAY_WINDOW;
        const selectable =
          validation.valid ||
          RESOLVABLE_TRANSACTION_LINK_REASONS.has(validation.reason);

        return {
          transaction,
          valid: validation.valid,
          reason: validation.reason,
          selectable,
          exactAmountMatch,
          exactDateMatch,
          nearDateMatch,
          dayDistance,
          amountDistance: Math.abs(
            Math.abs(transaction.amount) - Math.abs(sourceTransaction.amount),
          ),
          accountName:
            accountsById.get(transaction.accountId)?.name || 'Unknown Account',
        };
      })
      .sort((left, right) => {
        if (left.selectable !== right.selectable) {
          return left.selectable ? -1 : 1;
        }

        if (left.exactAmountMatch !== right.exactAmountMatch) {
          return left.exactAmountMatch ? -1 : 1;
        }

        if (left.exactDateMatch !== right.exactDateMatch) {
          return left.exactDateMatch ? -1 : 1;
        }

        if (left.nearDateMatch !== right.nearDateMatch) {
          return left.nearDateMatch ? -1 : 1;
        }

        if (left.dayDistance !== right.dayDistance) {
          return left.dayDistance - right.dayDistance;
        }

        if (left.amountDistance !== right.amountDistance) {
          return left.amountDistance - right.amountDistance;
        }

        return (
          left.accountName.localeCompare(right.accountName) ||
          String(left.transaction.description || '').localeCompare(
            String(right.transaction.description || ''),
          )
        );
      });
  }, [
    accountsById,
    activeTransactionLinks,
    sourceTransaction,
    sourceTransactionLink?.id,
    transactionSplitCounts,
    transactions,
  ]);

  const searchedCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return candidateRows.filter((candidate) => {
      if (!normalizedSearch) return true;

      return (
        candidate.accountName.toLowerCase().includes(normalizedSearch) ||
        String(candidate.transaction.description || '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [candidateRows, search]);

  const topCandidate = useMemo(
    () =>
      searchedCandidates.find(
        (candidate) => candidate.selectable && candidate.exactAmountMatch,
      ) ||
      searchedCandidates.find(
        (candidate) => candidate.selectable && candidate.nearDateMatch,
      ) ||
      searchedCandidates.find((candidate) => candidate.selectable) ||
      null,
    [searchedCandidates],
  );

  const otherExactCandidates = useMemo(
    () =>
      searchedCandidates.filter(
        (candidate) =>
          candidate.selectable &&
          candidate.exactAmountMatch &&
          candidate.transaction.id !== topCandidate?.transaction.id,
      ),
    [searchedCandidates, topCandidate],
  );

  const nearMatchCandidates = useMemo(
    () =>
      searchedCandidates.filter(
        (candidate) =>
          candidate.selectable &&
          candidate.nearDateMatch &&
          !candidate.exactAmountMatch &&
          candidate.transaction.id !== topCandidate?.transaction.id,
      ),
    [searchedCandidates, topCandidate],
  );

  const visibleCandidates = useMemo(() => {
    const rows = [];

    if (topCandidate) {
      rows.push({
        type: 'section',
        key: 'top-match',
        label: 'Top Match',
      });
      rows.push({
        type: 'candidate',
        key: topCandidate.transaction.id,
        candidate: topCandidate,
      });
    }

    if (otherExactCandidates.length > 0) {
      rows.push({
        type: 'section',
        key: 'other-matches',
        label: 'Other Exact Matches',
      });
      otherExactCandidates.forEach((candidate) => {
        rows.push({
          type: 'candidate',
          key: candidate.transaction.id,
          candidate,
        });
      });
    }

    if (showIneligible && nearMatchCandidates.length > 0) {
      rows.push({
        type: 'section',
        key: 'near-matches',
        label: `Near Matches (${TRANSACTION_NEAR_MATCH_DAY_WINDOW} days)`,
      });
      nearMatchCandidates.forEach((candidate) => {
        rows.push({
          type: 'candidate',
          key: candidate.transaction.id,
          candidate,
        });
      });
    }

    return rows;
  }, [nearMatchCandidates, otherExactCandidates, showIneligible, topCandidate]);

  const selectedCandidateRow = useMemo(
    () =>
      candidateRows.find((candidate) => candidate.transaction.id === selectedTargetId) ||
      null,
    [candidateRows, selectedTargetId],
  );

  useEffect(() => {
    if (!open || selectedTargetId || !topCandidate) return;

    setSelectedTargetId(topCandidate.transaction.id);
  }, [open, selectedTargetId, topCandidate]);

  useEffect(() => {
    if (!open || !sourceTransaction || !selectedCandidateRow) return;

    setSelectedDate(
      sourceTransaction.date ?? selectedCandidateRow.transaction.date ?? '',
    );
    setSelectedAbsoluteAmount(
      String(
        Math.abs(
          sourceTransaction.amount ??
            selectedCandidateRow.transaction.amount ??
            0,
        ),
      ),
    );
    setSelectedTransactionState(
      sourceTransaction.transactionState ??
        selectedCandidateRow.transaction.transactionState ??
        '',
    );
    setSyncDescription(false);
    setSharedDescription(
      sourceTransaction.description ??
        selectedCandidateRow.transaction.description ??
        '',
    );
    setErrorMessage('');
  }, [open, selectedCandidateRow, sourceTransaction]);

  const handleSave = async () => {
    if (!selectedTargetId || !selectedCandidateRow?.selectable) return;

    const result = await dispatch(
      transactionLinkActions.reconcileAndSaveTransactionLinkPair({
        sourceTransactionId,
        destinationTransactionId: selectedTargetId,
        reconciledDate: selectedDate || null,
        reconciledAbsoluteAmount:
          selectedAbsoluteAmount === ''
            ? null
            : Number.parseInt(selectedAbsoluteAmount, 10),
        reconciledTransactionState: selectedTransactionState || null,
        reconciledDescription: syncDescription ? sharedDescription : null,
      }),
    );

    if (!result?.valid) {
      setErrorMessage(result?.reason || 'Unable to link these transactions.');
      return;
    }

    onLinked?.(result.link);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Link Transaction</DialogTitle>
      <DialogContent>
        {sourceTransaction ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity='info'>
              Linking from{' '}
              <strong>
                {accountsById.get(sourceTransaction.accountId)?.name || 'Unknown'}
              </strong>
              : {sourceTransaction.description} on{' '}
              {formatTransactionLinkDateLabel(sourceTransaction.date)} for{' '}
              {formatTransactionLinkCurrency(sourceTransaction.amount)}
            </Alert>

            {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: { xs: 'stretch', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                label='Search accounts or descriptions'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                size='small'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showIneligible}
                    onChange={(event) =>
                      setShowIneligible(event.target.checked)
                    }
                  />
                }
                label='Show near matches'
              />
            </Box>

            <List
              dense
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                maxHeight: 360,
                overflow: 'auto',
              }}
            >
              {visibleCandidates.map((row) =>
                row.type === 'section' ? (
                  <Typography
                    key={row.key}
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      display: 'block',
                      px: 2,
                      pt: row.key === 'top-match' ? 1.5 : 2,
                      pb: 0.5,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.label}
                  </Typography>
                ) : (
                  <ListItemButton
                    key={row.key}
                    selected={selectedTargetId === row.candidate.transaction.id}
                    disabled={!row.candidate.selectable}
                    onClick={() => {
                      setSelectedTargetId(row.candidate.transaction.id);
                      setErrorMessage('');
                    }}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <Radio
                      checked={selectedTargetId === row.candidate.transaction.id}
                    />
                    <ListItemText
                      disableTypography
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {row.candidate.accountName}
                          </Typography>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {formatTransactionLinkCurrency(
                              row.candidate.transaction.amount,
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant='body2' color='text.primary'>
                            {row.candidate.transaction.description}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {formatTransactionLinkDateLabel(
                              row.candidate.transaction.date,
                            )}
                          </Typography>
                          {!row.candidate.valid && row.candidate.reason && (
                            <Typography
                              variant='caption'
                              color='warning.main'
                              sx={{ display: 'block' }}
                            >
                              {row.candidate.reason}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItemButton>
                ),
              )}

              {visibleCandidates.length === 0 && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ p: 2 }}
                >
                  No cross-account matches found.
                </Typography>
              )}
            </List>

            {selectedCandidateRow && (
              <TransactionLinkReconciliationPanel
                sourceTransaction={sourceTransaction}
                destinationTransaction={selectedCandidateRow.transaction}
                sourceAccountName={
                  accountsById.get(sourceTransaction.accountId)?.name ||
                  'Unknown'
                }
                destinationAccountName={selectedCandidateRow.accountName}
                sourceTitle='Source Transaction'
                destinationTitle='Selected Match'
                blockingReason={
                  selectedCandidateRow.selectable
                    ? ''
                    : selectedCandidateRow.reason || ''
                }
                errorMessage=''
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                selectedAbsoluteAmount={selectedAbsoluteAmount}
                onSelectedAbsoluteAmountChange={setSelectedAbsoluteAmount}
                selectedTransactionState={selectedTransactionState}
                onSelectedTransactionStateChange={setSelectedTransactionState}
                syncDescription={syncDescription}
                onSyncDescriptionChange={setSyncDescription}
                sharedDescription={sharedDescription}
                onSharedDescriptionChange={setSharedDescription}
              />
            )}
          </Box>
        ) : (
          <Alert severity='error'>The selected transaction could not be found.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={
            !selectedTargetId ||
            !selectedCandidateRow?.selectable ||
            (syncDescription && sharedDescription.trim() === '')
          }
        >
          Save Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
