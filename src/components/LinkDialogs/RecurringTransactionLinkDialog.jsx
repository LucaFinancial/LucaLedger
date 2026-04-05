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
import RecurringTransactionLinkReconciliationPanel from './RecurringTransactionLinkReconciliationPanel';
import {
  formatRecurringLinkCurrency,
  formatRecurringScheduleLabel,
  getRecurringScheduleDayDistance,
  RECURRING_NEAR_MATCH_DAY_WINDOW,
  RESOLVABLE_RECURRING_LINK_REASONS,
} from './recurringLinkDialogHelpers';
import {
  actions as recurringTransactionLinkActions,
  selectors as recurringTransactionLinkSelectors,
} from '@/store/recurringTransactionLinks';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as accountSelectors } from '@/store/accounts';
import { validateRecurringLinkCandidate } from '@/utils/linking';

const hasMatchingScheduleShape = (sourceTransaction, destinationTransaction) =>
  sourceTransaction.startOn === destinationTransaction.startOn &&
  sourceTransaction.frequency === destinationTransaction.frequency &&
  sourceTransaction.interval === destinationTransaction.interval &&
  (sourceTransaction.endOn || null) === (destinationTransaction.endOn || null);

export default function RecurringTransactionLinkDialog({
  open,
  onClose,
  sourceRecurringTransactionId,
  preselectedRecurringTransactionId = null,
  onLinked = null,
}) {
  const dispatch = useDispatch();
  const accounts = useSelector(accountSelectors.selectAccounts);
  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactions,
  );
  const activeRecurringTransactionLinks = useSelector(
    recurringTransactionLinkSelectors.selectActiveRecurringTransactionLinks,
  );
  const sourceRecurringTransaction = useSelector(
    useMemo(
      () =>
        sourceRecurringTransactionId
          ? recurringTransactionSelectors.selectRecurringTransactionById(
              sourceRecurringTransactionId,
            )
          : () => null,
      [sourceRecurringTransactionId],
    ),
  );
  const sourceRecurringTransactionLink = useSelector(
    useMemo(
      () =>
        sourceRecurringTransactionId
          ? recurringTransactionLinkSelectors.selectRecurringTransactionLinkByRecurringTransactionId(
              sourceRecurringTransactionId,
            )
          : () => null,
      [sourceRecurringTransactionId],
    ),
  );

  const [search, setSearch] = useState('');
  const [showIneligible, setShowIneligible] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedScheduleSource, setSelectedScheduleSource] = useState('source');
  const [selectedAbsoluteAmount, setSelectedAbsoluteAmount] = useState('');
  const [syncDescription, setSyncDescription] = useState(false);
  const [sharedDescription, setSharedDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );

  useEffect(() => {
    if (!open) return;

    const currentLinkedTargetId =
      sourceRecurringTransactionLink?.sourceRecurringTransactionId ===
      sourceRecurringTransactionId
        ? sourceRecurringTransactionLink.destinationRecurringTransactionId
        : sourceRecurringTransactionLink?.destinationRecurringTransactionId || '';

    setSearch('');
    setShowIneligible(false);
    setSelectedTargetId(
      preselectedRecurringTransactionId || currentLinkedTargetId || '',
    );
    setErrorMessage('');
  }, [
    open,
    preselectedRecurringTransactionId,
    sourceRecurringTransactionId,
    sourceRecurringTransactionLink,
  ]);

  const candidateRows = useMemo(() => {
    if (!sourceRecurringTransaction) return [];

    const linksForValidation = activeRecurringTransactionLinks.filter(
      (link) => link.id !== sourceRecurringTransactionLink?.id,
    );

    return recurringTransactions
      .filter(
        (transaction) =>
          transaction.id !== sourceRecurringTransaction.id &&
          transaction.accountId !== sourceRecurringTransaction.accountId,
      )
      .map((transaction) => {
        const validation = validateRecurringLinkCandidate({
          sourceRecurringTransaction,
          destinationRecurringTransaction: transaction,
          recurringTransactionLinks: linksForValidation,
        });
        const exactAmountMatch =
          Math.abs(transaction.amount) ===
          Math.abs(sourceRecurringTransaction.amount);
        const exactScheduleMatch = hasMatchingScheduleShape(sourceRecurringTransaction, transaction);
        const sameFrequency =
          transaction.frequency === sourceRecurringTransaction.frequency;
        const sameInterval =
          transaction.interval === sourceRecurringTransaction.interval;
        const sameCadence =
          sameFrequency &&
          sameInterval;
        const scheduleDayDistance = getRecurringScheduleDayDistance(
          sourceRecurringTransaction,
          transaction,
        );
        const nearScheduleDayMatch =
          scheduleDayDistance <= RECURRING_NEAR_MATCH_DAY_WINDOW;
        const sameEndDate =
          (transaction.endOn || null) ===
          (sourceRecurringTransaction.endOn || null);
        const amountDistance = Math.abs(
          Math.abs(transaction.amount) -
            Math.abs(sourceRecurringTransaction.amount),
        );
        const selectable =
          validation.valid ||
          RESOLVABLE_RECURRING_LINK_REASONS.has(validation.reason);

        return {
          recurringTransaction: transaction,
          valid: validation.valid,
          reason: validation.reason,
          selectable,
          exactAmountMatch,
          exactScheduleMatch,
          sameFrequency,
          sameInterval,
          sameCadence,
          nearScheduleDayMatch,
          sameEndDate,
          scheduleDayDistance,
          amountDistance,
          accountName:
            accountsById.get(transaction.accountId) || 'Unknown Account',
        };
      })
      .sort((left, right) => {
        if (left.selectable !== right.selectable) {
          return left.selectable ? -1 : 1;
        }

        if (left.sameFrequency !== right.sameFrequency) {
          return left.sameFrequency ? -1 : 1;
        }

        if (left.sameInterval !== right.sameInterval) {
          return left.sameInterval ? -1 : 1;
        }

        if (left.nearScheduleDayMatch !== right.nearScheduleDayMatch) {
          return left.nearScheduleDayMatch ? -1 : 1;
        }

        if (left.exactAmountMatch !== right.exactAmountMatch) {
          return left.exactAmountMatch ? -1 : 1;
        }

        if (left.sameEndDate !== right.sameEndDate) {
          return left.sameEndDate ? -1 : 1;
        }

        if (left.scheduleDayDistance !== right.scheduleDayDistance) {
          return left.scheduleDayDistance - right.scheduleDayDistance;
        }

        if (left.amountDistance !== right.amountDistance) {
          return left.amountDistance - right.amountDistance;
        }

        return (
          left.accountName.localeCompare(right.accountName) ||
          String(left.recurringTransaction.description || '').localeCompare(
            String(right.recurringTransaction.description || ''),
          )
        );
      });
  }, [
    accountsById,
    activeRecurringTransactionLinks,
    recurringTransactions,
    sourceRecurringTransaction,
    sourceRecurringTransactionLink?.id,
  ]);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return candidateRows.filter((candidate) => {
      if (!normalizedSearch) return true;

      return (
        candidate.accountName.toLowerCase().includes(normalizedSearch) ||
        String(candidate.recurringTransaction.description || '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [candidateRows, search]);

  const topCandidate = useMemo(
    () =>
      filteredCandidates.find(
        (candidate) =>
          candidate.selectable &&
          candidate.sameCadence &&
          candidate.nearScheduleDayMatch &&
          candidate.exactAmountMatch,
      ) ||
      filteredCandidates.find(
        (candidate) =>
          candidate.selectable &&
          candidate.sameCadence &&
          candidate.nearScheduleDayMatch,
      ) ||
      filteredCandidates.find(
        (candidate) =>
          candidate.selectable &&
          candidate.sameCadence,
      ) ||
      filteredCandidates.find((candidate) => candidate.selectable) ||
      null,
    [filteredCandidates],
  );

  const exactCandidates = useMemo(
    () =>
      filteredCandidates.filter(
        (candidate) =>
          candidate.selectable &&
          candidate.sameCadence &&
          candidate.nearScheduleDayMatch &&
          candidate.exactAmountMatch &&
          candidate.recurringTransaction.id !== topCandidate?.recurringTransaction.id,
      ),
    [filteredCandidates, topCandidate],
  );

  const nearMatchCandidates = useMemo(
    () =>
      filteredCandidates.filter(
        (candidate) =>
          candidate.selectable &&
          candidate.sameCadence &&
          candidate.nearScheduleDayMatch &&
          candidate.recurringTransaction.id !== topCandidate?.recurringTransaction.id &&
          !(
            candidate.sameCadence &&
            candidate.nearScheduleDayMatch &&
            candidate.exactAmountMatch
          ),
      ),
    [filteredCandidates, topCandidate],
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
        key: topCandidate.recurringTransaction.id,
        candidate: topCandidate,
      });
    }

    if (exactCandidates.length > 0) {
      rows.push({
        type: 'section',
        key: 'exact-matches',
        label: 'Other Exact Matches',
      });
      exactCandidates.forEach((candidate) => {
        rows.push({
          type: 'candidate',
          key: candidate.recurringTransaction.id,
          candidate,
        });
      });
    }

    if (showIneligible && nearMatchCandidates.length > 0) {
      rows.push({
        type: 'section',
        key: 'near-matches',
        label: `Near Matches (${RECURRING_NEAR_MATCH_DAY_WINDOW} days)`,
      });
      nearMatchCandidates.forEach((candidate) => {
        rows.push({
          type: 'candidate',
          key: candidate.recurringTransaction.id,
          candidate,
        });
      });
    }

    return rows;
  }, [exactCandidates, nearMatchCandidates, showIneligible, topCandidate]);

  const selectedCandidateRow = useMemo(
    () =>
      candidateRows.find(
        (candidate) => candidate.recurringTransaction.id === selectedTargetId,
      ) || null,
    [candidateRows, selectedTargetId],
  );

  useEffect(() => {
    if (!open || selectedTargetId || !topCandidate) return;

    setSelectedTargetId(topCandidate.recurringTransaction.id);
  }, [open, selectedTargetId, topCandidate]);

  useEffect(() => {
    if (!open || !sourceRecurringTransaction || !selectedCandidateRow) return;

    setSelectedScheduleSource('source');
    setSelectedAbsoluteAmount(
      String(
        Math.abs(
          sourceRecurringTransaction.amount ??
            selectedCandidateRow.recurringTransaction.amount ??
            0,
        ),
      ),
    );
    setSyncDescription(false);
    setSharedDescription(
      sourceRecurringTransaction.description ??
        selectedCandidateRow.recurringTransaction.description ??
        '',
    );
    setErrorMessage('');
  }, [open, selectedCandidateRow, sourceRecurringTransaction]);

  const handleSave = async () => {
    if (!selectedTargetId || !selectedCandidateRow?.selectable) return;

    const result = await dispatch(
      recurringTransactionLinkActions.reconcileAndSaveRecurringTransactionLinkPair(
        {
          sourceRecurringTransactionId,
          destinationRecurringTransactionId: selectedTargetId,
          reconciledAbsoluteAmount:
            selectedAbsoluteAmount === ''
              ? null
              : Number.parseInt(selectedAbsoluteAmount, 10),
          reconciledScheduleSource: selectedScheduleSource,
          reconciledDescription: syncDescription ? sharedDescription : null,
        },
      ),
    );

    if (!result?.valid) {
      setErrorMessage(
        result?.reason || 'Unable to link these recurring transactions.',
      );
      return;
    }

    onLinked?.(result.link);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Link Recurring Transaction</DialogTitle>
      <DialogContent>
        {sourceRecurringTransaction ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity='info'>
              Linking recurring rule from{' '}
              <strong>
                {accountsById.get(sourceRecurringTransaction.accountId) ||
                  'Unknown'}
              </strong>
              : {sourceRecurringTransaction.description} for{' '}
              {formatRecurringLinkCurrency(sourceRecurringTransaction.amount)}
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
                    selected={
                      selectedTargetId === row.candidate.recurringTransaction.id
                    }
                    disabled={!row.candidate.selectable}
                    onClick={() => {
                      setSelectedTargetId(
                        row.candidate.recurringTransaction.id,
                      );
                      setErrorMessage('');
                    }}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <Radio
                      checked={
                        selectedTargetId === row.candidate.recurringTransaction.id
                      }
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
                            {formatRecurringLinkCurrency(
                              row.candidate.recurringTransaction.amount,
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant='body2' color='text.primary'>
                            {row.candidate.recurringTransaction.description}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {formatRecurringScheduleLabel(
                              row.candidate.recurringTransaction,
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
                  No recurring-rule matches found.
                </Typography>
              )}
            </List>

            {selectedCandidateRow && (
              <RecurringTransactionLinkReconciliationPanel
                sourceRecurringTransaction={sourceRecurringTransaction}
                destinationRecurringTransaction={
                  selectedCandidateRow.recurringTransaction
                }
                sourceAccountName={
                  accountsById.get(sourceRecurringTransaction.accountId) ||
                  'Unknown'
                }
                destinationAccountName={selectedCandidateRow.accountName}
                sourceTitle='Source Rule'
                destinationTitle='Selected Match'
                blockingReason={
                  selectedCandidateRow.selectable
                    ? ''
                    : selectedCandidateRow.reason || ''
                }
                errorMessage=''
                selectedScheduleSource={selectedScheduleSource}
                onSelectedScheduleSourceChange={setSelectedScheduleSource}
                selectedAbsoluteAmount={selectedAbsoluteAmount}
                onSelectedAbsoluteAmountChange={setSelectedAbsoluteAmount}
                syncDescription={syncDescription}
                onSyncDescriptionChange={setSyncDescription}
                sharedDescription={sharedDescription}
                onSharedDescriptionChange={setSharedDescription}
              />
            )}
          </Box>
        ) : (
          <Alert severity='error'>
            The selected recurring transaction could not be found.
          </Alert>
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
