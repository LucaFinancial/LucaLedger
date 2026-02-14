import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '@/auth';
import {
  setEncryptionStatus,
  setAuthStatus,
  setSessionExpiresAt,
  setError,
  EncryptionStatus,
  AuthStatus,
} from '@/store/encryption';
import {
  getUserEncryptedRecords,
  batchStoreUserEncryptedRecords,
} from '@/crypto/database';
import { setAccounts } from '@/store/accounts/slice';
import { setTransactions } from '@/store/transactions/slice';
import { setCategories } from '@/store/categories/slice';
import { setStatements } from '@/store/statements/slice';
import { setRecurringTransactions } from '@/store/recurringTransactions/slice';
import { setRecurringTransactionEvents } from '@/store/recurringTransactionEvents/slice';
import { setTransactionSplits } from '@/store/transactionSplits/slice';
import categoriesData from '@/config/categories.json';
import { migrateDataToSchema } from '@/utils/dataMigration';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import ValidationErrorsDialog from '@/components/ValidationErrorsDialog';
import {
  fixDateFormatIssues,
  processLoadedData,
  removeInvalidObjects,
} from '@/utils/dataProcessing';
import { downloadValidationErrorsJson } from '@/utils/validationErrorsJson';

export default function EncryptionProvider() {
  const dispatch = useDispatch();
  const { authState, currentUser, activeDEK, sessionExpiresAt } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [validationState, setValidationState] = useState({
    open: false,
    errors: [],
  });
  const validationResolveRef = useRef(null);

  const openValidationDialog = useCallback((errors) => {
    return new Promise((resolve) => {
      validationResolveRef.current = resolve;
      setValidationState({ open: true, errors });
    });
  }, []);

  const closeValidationDialog = useCallback((action) => {
    if (validationResolveRef.current) {
      validationResolveRef.current(action);
    }
    validationResolveRef.current = null;
    setValidationState({ open: false, errors: [] });
  }, []);

  const runValidationFlow = useCallback(
    async (result, schemaVersion) => {
      let current = result;

      while (current.errors.length > 0) {
        setLoading(false);
        const action = await openValidationDialog(current.errors);

        if (action === 'apply-defaults') {
          setLoading(true);
          current = processLoadedData(current.data, {
            schemaVersion,
            applyDefaults: true,
          });
          continue;
        }

        if (action === 'remove-invalid') {
          setLoading(true);
          const removal = removeInvalidObjects(current.data, current.errors);
          current = processLoadedData(removal.data, { schemaVersion });
          continue;
        }

        if (action === 'fix-dates-all') {
          setLoading(true);
          const fixed = fixDateFormatIssues(current.data, current.errors);
          current = processLoadedData(fixed.data, { schemaVersion });
          continue;
        }

        if (action?.type === 'fix-date-one') {
          setLoading(true);
          const fixed = fixDateFormatIssues(current.data, current.errors, {
            errorIndexes: [action.errorIndex],
          });
          current = processLoadedData(fixed.data, { schemaVersion });
          continue;
        }

        return null;
      }

      return current;
    },
    [openValidationDialog],
  );

  // Load user data when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (
        authState !== 'authenticated' ||
        !currentUser ||
        !activeDEK ||
        dataLoaded
      ) {
        return;
      }

      setLoading(true);
      setLoadingMessage('Loading your data...');

      try {
        // Update encryption status
        dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTED));
        dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
        if (sessionExpiresAt) {
          dispatch(setSessionExpiresAt(sessionExpiresAt));
        }

        // Load encrypted data for this user
        let [
          encryptedAccounts,
          encryptedTransactions,
          encryptedCategories,
          encryptedStatements,
          encryptedRecurringTransactions,
          encryptedRecurringTransactionEvents,
          encryptedTransactionSplits,
        ] = await Promise.all([
          getUserEncryptedRecords('accounts', activeDEK, currentUser.id),
          getUserEncryptedRecords('transactions', activeDEK, currentUser.id),
          getUserEncryptedRecords('categories', activeDEK, currentUser.id),
          getUserEncryptedRecords('statements', activeDEK, currentUser.id),
          getUserEncryptedRecords(
            'recurringTransactions',
            activeDEK,
            currentUser.id,
          ),
          getUserEncryptedRecords(
            'recurringTransactionEvents',
            activeDEK,
            currentUser.id,
          ),
          getUserEncryptedRecords(
            'transactionSplits',
            activeDEK,
            currentUser.id,
          ),
        ]);

        const rawData = {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          accounts: encryptedAccounts || [],
          transactions: encryptedTransactions || [],
          categories: encryptedCategories || [],
          statements: encryptedStatements || [],
          recurringTransactions: encryptedRecurringTransactions || [],
          recurringTransactionEvents: encryptedRecurringTransactionEvents || [],
          transactionSplits: encryptedTransactionSplits || [],
        };

        const processed = await runValidationFlow(
          processLoadedData(rawData, { schemaVersion: CURRENT_SCHEMA_VERSION }),
          CURRENT_SCHEMA_VERSION,
        );

        if (!processed) {
          setLoading(false);
          return;
        }

        encryptedAccounts = processed.data.accounts;
        encryptedTransactions = processed.data.transactions;
        encryptedCategories = processed.data.categories;
        encryptedStatements = processed.data.statements;
        encryptedRecurringTransactions = processed.data.recurringTransactions;
        encryptedRecurringTransactionEvents =
          processed.data.recurringTransactionEvents;
        encryptedTransactionSplits = processed.data.transactionSplits;

        if (processed.changed) {
          const recordWrites = [
            batchStoreUserEncryptedRecords(
              'accounts',
              encryptedAccounts.map((account) => ({
                id: account.id,
                data: account,
              })),
              activeDEK,
              currentUser.id,
            ),
            batchStoreUserEncryptedRecords(
              'transactions',
              encryptedTransactions.map((transaction) => ({
                id: transaction.id,
                data: transaction,
              })),
              activeDEK,
              currentUser.id,
            ),
            batchStoreUserEncryptedRecords(
              'categories',
              encryptedCategories.map((category) => ({
                id: category.id,
                data: category,
              })),
              activeDEK,
              currentUser.id,
            ),
            batchStoreUserEncryptedRecords(
              'statements',
              encryptedStatements.map((statement) => ({
                id: statement.id,
                data: statement,
              })),
              activeDEK,
              currentUser.id,
            ),
            batchStoreUserEncryptedRecords(
              'recurringTransactions',
              encryptedRecurringTransactions.map((recurringTransaction) => ({
                id: recurringTransaction.id,
                data: recurringTransaction,
              })),
              activeDEK,
              currentUser.id,
            ),
            batchStoreUserEncryptedRecords(
              'recurringTransactionEvents',
              encryptedRecurringTransactionEvents.map(
                (recurringTransactionEvent) => ({
                  id: recurringTransactionEvent.id,
                  data: recurringTransactionEvent,
                }),
              ),
              activeDEK,
              currentUser.id,
            ),
            batchStoreUserEncryptedRecords(
              'transactionSplits',
              encryptedTransactionSplits.map((transactionSplit) => ({
                id: transactionSplit.id,
                data: transactionSplit,
              })),
              activeDEK,
              currentUser.id,
            ),
          ];

          await Promise.all(recordWrites);
        }

        // Initialize categories with defaults if none exist
        const migrationTimestamp = new Date().toISOString();
        let categoriesToLoad = encryptedCategories || [];
        if (categoriesToLoad.length === 0) {
          const defaultCategories = migrateDataToSchema(
            {
              categories: categoriesData.categories,
            },
            {
              timestamp: migrationTimestamp,
            },
          );
          categoriesToLoad = defaultCategories.data.categories;
          console.log('Initialized default categories for encrypted storage');

          // Save default categories to encrypted storage
          const categoryRecords = categoriesToLoad.map((category) => ({
            id: category.id,
            data: category,
          }));
          await batchStoreUserEncryptedRecords(
            'categories',
            categoryRecords,
            activeDEK,
            currentUser.id,
          );
        }

        // Replace entire state
        dispatch(setAccounts(encryptedAccounts));
        dispatch(setTransactions(encryptedTransactions));
        dispatch(setCategories(categoriesToLoad));
        dispatch(setStatements(encryptedStatements || []));
        dispatch(
          setRecurringTransactions(encryptedRecurringTransactions || []),
        );
        dispatch(
          setRecurringTransactionEvents(
            encryptedRecurringTransactionEvents || [],
          ),
        );
        dispatch(setTransactionSplits(encryptedTransactionSplits || []));

        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load user data:', error);
        dispatch(setError('Failed to load your data: ' + error.message));
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [
    authState,
    currentUser,
    activeDEK,
    sessionExpiresAt,
    dataLoaded,
    dispatch,
    runValidationFlow,
  ]);

  // Reset data loaded state when user changes
  useEffect(() => {
    if (!currentUser) {
      setDataLoaded(false);
      // Clear Redux state when logged out
      dispatch(setAccounts([]));
      dispatch(setTransactions([]));
      dispatch(setCategories([]));
      dispatch(setStatements([]));
      dispatch(setRecurringTransactions([]));
      dispatch(setRecurringTransactionEvents([]));
      dispatch(setTransactionSplits([]));
      dispatch(setEncryptionStatus(EncryptionStatus.UNENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
    }
  }, [currentUser, dispatch]);

  // Show loading progress
  return (
    <>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant='h6' sx={{ mt: 2, color: 'white' }}>
            {loadingMessage}
          </Typography>
          <Typography variant='body2' sx={{ mt: 1, color: 'white' }}>
            Please wait...
          </Typography>
        </Box>
      )}
      <ValidationErrorsDialog
        open={validationState.open}
        errors={validationState.errors}
        onDownloadJson={() =>
          downloadValidationErrorsJson(validationState.errors)
        }
        onApplyDefaults={() => closeValidationDialog('apply-defaults')}
        onRemoveInvalid={() => closeValidationDialog('remove-invalid')}
        onFixAllDates={() => closeValidationDialog('fix-dates-all')}
        onFixError={(errorIndex) =>
          closeValidationDialog({ type: 'fix-date-one', errorIndex })
        }
        onCancel={() => closeValidationDialog('cancel')}
      />
    </>
  );
}
