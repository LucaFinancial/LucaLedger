import { useEffect, useState } from 'react';
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

export default function EncryptionProvider() {
  const dispatch = useDispatch();
  const { authState, currentUser, activeDEK, sessionExpiresAt } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

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

        const migrationTimestamp = new Date().toISOString();
        const hasLegacyTransactions = (encryptedTransactions || []).some(
          (transaction) =>
            typeof transaction.status === 'string' ||
            !transaction.transactionState,
        );
        const hasNonIntegerAmounts = (encryptedTransactions || []).some(
          (transaction) =>
            typeof transaction.amount === 'number' &&
            !Number.isInteger(transaction.amount),
        );
        const migration = migrateDataToSchema(
          {
            accounts: encryptedAccounts || [],
            transactions: encryptedTransactions || [],
            categories: encryptedCategories || [],
            statements: encryptedStatements || [],
            recurringTransactions: encryptedRecurringTransactions || [],
            recurringTransactionEvents:
              encryptedRecurringTransactionEvents || [],
            transactionSplits: encryptedTransactionSplits || [],
          },
          {
            convertTransactionAmounts:
              hasLegacyTransactions || hasNonIntegerAmounts,
            timestamp: migrationTimestamp,
          },
        );

        if (migration.changed) {
          encryptedAccounts = migration.data.accounts;
          encryptedTransactions = migration.data.transactions;
          encryptedCategories = migration.data.categories;
          encryptedStatements = migration.data.statements;
          encryptedRecurringTransactions = migration.data.recurringTransactions;
          encryptedRecurringTransactionEvents =
            migration.data.recurringTransactionEvents;
          encryptedTransactionSplits = migration.data.transactionSplits;

          const recordWrites = [];

          if (migration.changes.accounts) {
            recordWrites.push(
              batchStoreUserEncryptedRecords(
                'accounts',
                encryptedAccounts.map((account) => ({
                  id: account.id,
                  data: account,
                })),
                activeDEK,
                currentUser.id,
              ),
            );
          }

          if (migration.changes.transactions) {
            recordWrites.push(
              batchStoreUserEncryptedRecords(
                'transactions',
                encryptedTransactions.map((transaction) => ({
                  id: transaction.id,
                  data: transaction,
                })),
                activeDEK,
                currentUser.id,
              ),
            );
          }

          if (migration.changes.categories) {
            recordWrites.push(
              batchStoreUserEncryptedRecords(
                'categories',
                encryptedCategories.map((category) => ({
                  id: category.id,
                  data: category,
                })),
                activeDEK,
                currentUser.id,
              ),
            );
          }

          if (migration.changes.statements) {
            recordWrites.push(
              batchStoreUserEncryptedRecords(
                'statements',
                encryptedStatements.map((statement) => ({
                  id: statement.id,
                  data: statement,
                })),
                activeDEK,
                currentUser.id,
              ),
            );
          }

          if (migration.changes.recurringTransactions) {
            recordWrites.push(
              batchStoreUserEncryptedRecords(
                'recurringTransactions',
                encryptedRecurringTransactions.map((recurringTransaction) => ({
                  id: recurringTransaction.id,
                  data: recurringTransaction,
                })),
                activeDEK,
                currentUser.id,
              ),
            );
          }

          if (migration.changes.recurringTransactionEvents) {
            recordWrites.push(
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
            );
          }

          if (migration.changes.transactionSplits) {
            recordWrites.push(
              batchStoreUserEncryptedRecords(
                'transactionSplits',
                encryptedTransactionSplits.map((transactionSplit) => ({
                  id: transactionSplit.id,
                  data: transactionSplit,
                })),
                activeDEK,
                currentUser.id,
              ),
            );
          }

          if (recordWrites.length > 0) {
            await Promise.all(recordWrites);
          }
        }

        // Initialize categories with defaults if none exist
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
        } else {
          console.log(
            `Loaded ${categoriesToLoad.length} custom categories from encrypted storage`,
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
  if (loading) {
    return (
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
    );
  }

  return null;
}
