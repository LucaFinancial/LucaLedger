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
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import { dollarsToCents } from '@/utils';
import categoriesData from '@/config/categories.json';

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

        // Load user's encrypted data
        // Check schema version from localStorage
        let schemaVersion = localStorage.getItem('dataSchemaVersion');

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
            currentUser.id
          ),
          getUserEncryptedRecords(
            'recurringTransactionEvents',
            activeDEK,
            currentUser.id
          ),
          getUserEncryptedRecords(
            'transactionSplits',
            activeDEK,
            currentUser.id
          ),
        ]);

        // Check if we need to migrate from schema 2.0.0 to 2.0.1
        const needsMigration =
          !schemaVersion ||
          schemaVersion === '2.0.0' ||
          (schemaVersion < CURRENT_SCHEMA_VERSION &&
            encryptedTransactions.length > 0);

        if (needsMigration) {
          localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);

          console.log(
            `[IndexedDB Migration] Migrating encrypted data from schema ${
              schemaVersion || 'unknown'
            } to ${CURRENT_SCHEMA_VERSION}`
          );

          let amountConversionCount = 0;

          // Migrate transactions
          const migratedTransactions = encryptedTransactions.map(
            (transaction) => {
              let updated = { ...transaction };

              if (
                (!schemaVersion || schemaVersion === '2.0.0') &&
                typeof updated.amount === 'number'
              ) {
                updated.amount = dollarsToCents(updated.amount);
                amountConversionCount++;
              }

              return updated;
            }
          );

          if (amountConversionCount > 0) {
            console.log(
              `[IndexedDB Migration] Converted ${amountConversionCount} transaction amounts to cents`
            );
          }

          // Save migrated transactions back to IndexedDB
          const transactionRecords = migratedTransactions.map(
            (transaction) => ({
              id: transaction.id,
              data: transaction,
            })
          );

          await batchStoreUserEncryptedRecords(
            'transactions',
            transactionRecords,
            activeDEK,
            currentUser.id
          );

          console.log(
            `[IndexedDB Migration] Updated schema version to ${CURRENT_SCHEMA_VERSION}`
          );

          encryptedTransactions = migratedTransactions;
        }

        // Initialize categories with defaults if none exist
        let categoriesToLoad = encryptedCategories || [];
        if (categoriesToLoad.length === 0) {
          categoriesToLoad = categoriesData.categories;
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
            currentUser.id
          );
        } else {
          console.log(
            `Loaded ${categoriesToLoad.length} custom categories from encrypted storage`
          );
        }

        // Replace entire state
        dispatch(setAccounts(encryptedAccounts));
        dispatch(setTransactions(encryptedTransactions));
        dispatch(setCategories(categoriesToLoad));
        dispatch(setStatements(encryptedStatements || []));
        dispatch(
          setRecurringTransactions(encryptedRecurringTransactions || [])
        );
        dispatch(
          setRecurringTransactionEvents(
            encryptedRecurringTransactionEvents || []
          )
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
        <Typography
          variant='h6'
          sx={{ mt: 2, color: 'white' }}
        >
          {loadingMessage}
        </Typography>
        <Typography
          variant='body2'
          sx={{ mt: 1, color: 'white' }}
        >
          Please wait...
        </Typography>
      </Box>
    );
  }

  return null;
}
