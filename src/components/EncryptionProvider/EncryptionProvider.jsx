import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, Box, Typography } from '@mui/material';
import {
  EncryptionPromptDialog,
  PasswordSetupDialog,
  UnlockDialog,
} from '@/components/EncryptionSetup';
import {
  setEncryptionStatus,
  setAuthStatus,
  setShowPrompt,
  setPromptDismissedAt,
  setSessionExpiresAt,
  setError,
  EncryptionStatus,
  AuthStatus,
  selectors as encryptionSelectors,
} from '@/store/encryption';
import {
  initializeEncryption,
  unlockEncryption,
  hasValidSessionToken,
  restoreSessionFromToken,
  clearActiveDEK,
  getActiveDEK,
} from '@/crypto/keyManager';
import {
  hasEncryptedData,
  batchStoreEncryptedRecords,
  clearAllData,
  getAllEncryptedRecords,
} from '@/crypto/database';
import { setAccounts } from '@/store/accounts/slice';
import { setTransactions } from '@/store/transactions/slice';
import { setCategories } from '@/store/categories/slice';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import { dollarsToCents } from '@/utils';
import categoriesData from '@/config/categories.json';

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export default function EncryptionProvider() {
  const dispatch = useDispatch();
  const showPrompt = useSelector(encryptionSelectors.selectShowPrompt);
  const promptDismissedAt = useSelector(
    encryptionSelectors.selectPromptDismissedAt
  );

  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Get Redux state for migration using proper selectors
  const accounts = useSelector(accountSelectors.selectAccounts);
  const transactions = useSelector(transactionSelectors.selectTransactions);
  const categories = useSelector(categorySelectors.selectAllCategories);

  useEffect(() => {
    const checkStatus = async () => {
      const hasEncrypted = await hasEncryptedData();
      const hasLocalStorage = localStorage.getItem('reduxState');

      if (hasEncrypted) {
        // Data is encrypted, need to unlock
        dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTED));

        // Check if we have a valid session token - if so, try to auto-restore
        if (hasValidSessionToken()) {
          try {
            setLoading(true);
            setLoadingMessage('Loading your data...');

            // Auto-restore session without password
            const result = await restoreSessionFromToken();

            if (result) {
              const { dek, expiresAt } = result;

              // Load encrypted data into Redux
              await loadEncryptedDataIntoRedux(dek);

              // Update auth status
              dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
              dispatch(setSessionExpiresAt(expiresAt));

              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Failed to auto-restore session:', error);
          }
          setLoading(false);
        }

        // No valid session or restore failed, show unlock dialog
        dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
        setShowUnlock(true);
      } else if (hasLocalStorage) {
        // Has unencrypted data, show prompt
        dispatch(setEncryptionStatus(EncryptionStatus.UNENCRYPTED));

        // Check if we should show the prompt
        const shouldShow =
          !promptDismissedAt || Date.now() - promptDismissedAt >= TWO_DAYS_MS;
        if (shouldShow) {
          dispatch(setShowPrompt(true));
        }
      } else {
        // No data at all, don't prompt until user creates data
        dispatch(setEncryptionStatus(EncryptionStatus.UNENCRYPTED));
        dispatch(setAuthStatus(AuthStatus.AUTHENTICATED)); // Allow access
      }
    };
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEncryptNow = () => {
    dispatch(setShowPrompt(false));
    setShowPasswordSetup(true);
  };

  const handleRemindLater = () => {
    dispatch(setShowPrompt(false));
    dispatch(setAuthStatus(AuthStatus.AUTHENTICATED)); // Allow access without encryption
  };

  const handleDismiss = () => {
    dispatch(setShowPrompt(false));
    dispatch(setPromptDismissedAt(Date.now()));
    dispatch(setAuthStatus(AuthStatus.AUTHENTICATED)); // Allow access without encryption
  };

  const handlePasswordSetupComplete = async (password, stayLoggedIn) => {
    setShowPasswordSetup(false);
    setMigrating(true);

    try {
      dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTING));

      // Initialize encryption and get DEK
      const { dek, expiresAt } = await initializeEncryption(
        password,
        stayLoggedIn
      );

      // Migrate data from localStorage to IndexedDB
      await migrateDataToEncrypted(dek);

      // Clear localStorage data (schema version is in dataSchemaVersion, not reduxState)
      const emptyState = {
        accounts: {
          data: [],
          loading: false,
          error: null,
          loadingAccountIds: [],
        },
        transactions: [],
      };
      localStorage.setItem('reduxState', JSON.stringify(emptyState));

      // Update encryption status
      dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
      if (expiresAt) {
        dispatch(setSessionExpiresAt(expiresAt));
      }

      setMigrating(false);
    } catch (error) {
      console.error('Encryption setup failed:', error);
      dispatch(setError('Failed to set up encryption: ' + error.message));
      setMigrating(false);

      // Rollback
      await clearAllData();
      clearActiveDEK();
      dispatch(setEncryptionStatus(EncryptionStatus.UNENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
    }
  };

  const handlePasswordSetupCancel = () => {
    setShowPasswordSetup(false);
    dispatch(setAuthStatus(AuthStatus.AUTHENTICATED)); // Allow access without encryption
  };

  const loadEncryptedDataIntoRedux = async (dek) => {
    // Check schema version from localStorage
    let schemaVersion = localStorage.getItem('dataSchemaVersion');

    // Load encrypted data into Redux
    let [encryptedAccounts, encryptedTransactions, encryptedCategories] =
      await Promise.all([
        getAllEncryptedRecords('accounts', dek),
        getAllEncryptedRecords('transactions', dek),
        getAllEncryptedRecords('categories', dek),
      ]);

    // Check if we need to migrate from schema 2.0.0 to 2.0.1
    const needsMigration =
      !schemaVersion ||
      schemaVersion === '2.0.0' ||
      (schemaVersion < CURRENT_SCHEMA_VERSION &&
        encryptedTransactions.length > 0);

    if (needsMigration) {
      // Update schema version IMMEDIATELY to prevent double migration
      // if this function is called twice concurrently
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);

      console.log(
        `[IndexedDB Migration] Migrating encrypted data from schema ${
          schemaVersion || 'unknown'
        } to ${CURRENT_SCHEMA_VERSION}`
      );

      let amountConversionCount = 0;

      // Migrate transactions
      const migratedTransactions = encryptedTransactions.map((transaction) => {
        let updated = { ...transaction };

        // Migration 2.0.0 → 2.0.1: Convert amounts from dollars to cents
        if (
          (!schemaVersion || schemaVersion === '2.0.0') &&
          typeof updated.amount === 'number'
        ) {
          updated.amount = dollarsToCents(updated.amount);
          amountConversionCount++;
        }

        return updated;
      });

      if (amountConversionCount > 0) {
        console.log(
          `[IndexedDB Migration] Converted ${amountConversionCount} transaction amounts to cents`
        );
      }

      // Save migrated transactions back to IndexedDB
      const transactionRecords = migratedTransactions.map((transaction) => ({
        id: transaction.id,
        data: transaction,
      }));

      await batchStoreEncryptedRecords('transactions', transactionRecords, dek);

      console.log(
        `[IndexedDB Migration] Updated schema version to ${CURRENT_SCHEMA_VERSION}`
      );

      // Use migrated data
      encryptedTransactions = migratedTransactions;
    } else if (schemaVersion === CURRENT_SCHEMA_VERSION) {
      // Data already migrated, but ensure schema version is set
      console.log(
        `[IndexedDB] Schema version already at ${CURRENT_SCHEMA_VERSION}`
      );
    } else if (encryptedTransactions.length > 0 && !schemaVersion) {
      // Has data but no schema version - set it
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
      console.log(
        `[IndexedDB] Set initial schema version to ${CURRENT_SCHEMA_VERSION}`
      );
    }

    // Clear localStorage data to prevent duplicates
    const emptyState = {
      accounts: {
        data: [],
        loading: false,
        error: null,
        loadingAccountIds: [],
      },
      transactions: [],
      categories: [],
    };
    localStorage.setItem('reduxState', JSON.stringify(emptyState));

    // Initialize categories with defaults if none exist (treat as user data)
    let categoriesToLoad = encryptedCategories || [];
    if (categoriesToLoad.length === 0) {
      categoriesToLoad = categoriesData.categories;
      console.log('Initialized default categories for encrypted storage');

      // Save default categories to encrypted storage
      const categoryRecords = categoriesToLoad.map((category) => ({
        id: category.id,
        data: category,
      }));
      await batchStoreEncryptedRecords('categories', categoryRecords, dek);
    } else {
      console.log(
        `Loaded ${categoriesToLoad.length} custom categories from encrypted storage`
      );
    }

    // Replace entire state (not add) to avoid duplicates from preloadedState
    dispatch(setAccounts(encryptedAccounts));
    dispatch(setTransactions(encryptedTransactions));
    dispatch(setCategories(categoriesToLoad));
  };

  const handleUnlock = async (password, stayLoggedIn) => {
    try {
      setUnlockError(null);
      setLoading(true);
      setLoadingMessage('Loading your data...');

      // Unlock encryption (this sets the active DEK)
      const { expiresAt } = await unlockEncryption(password, stayLoggedIn);

      // Get the DEK that was just set by unlockEncryption
      const dek = getActiveDEK();
      if (dek) {
        await loadEncryptedDataIntoRedux(dek);
      }

      // Update auth status
      dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
      if (expiresAt) {
        dispatch(setSessionExpiresAt(expiresAt));
      }

      setLoading(false);
      setShowUnlock(false);
    } catch (error) {
      console.error('Unlock failed:', error);
      setUnlockError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  const migrateDataToEncrypted = async (dek) => {
    // Ensure accounts, transactions, and categories are arrays (defensive check)
    const accountsArray = Array.isArray(accounts) ? accounts : [];
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    const categoriesArray = Array.isArray(categories) ? categories : [];

    // Prepare accounts, transactions, and categories for batch encryption
    const accountRecords = accountsArray.map((account) => ({
      id: account.id,
      data: account,
    }));

    const transactionRecords = transactionsArray.map((transaction) => ({
      id: transaction.id,
      data: transaction,
    }));

    const categoryRecords = categoriesArray.map((category) => ({
      id: category.id,
      data: category,
    }));

    // Batch encrypt and store
    await batchStoreEncryptedRecords('accounts', accountRecords, dek);
    await batchStoreEncryptedRecords('transactions', transactionRecords, dek);
    await batchStoreEncryptedRecords('categories', categoryRecords, dek);

    console.log(
      `Migrated ${accountsArray.length} accounts, ${transactionsArray.length} transactions, and ${categoriesArray.length} categories to encrypted storage`
    );
  };

  // Show migration or loading progress
  if (migrating || loading) {
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
          {migrating ? 'Encrypting your data...' : loadingMessage}
        </Typography>
        <Typography
          variant='body2'
          sx={{ mt: 1, color: 'white' }}
        >
          {migrating
            ? 'This may take a moment. Please do not close the app.'
            : 'Please wait...'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <EncryptionPromptDialog
        open={showPrompt}
        onEncryptNow={handleEncryptNow}
        onRemindLater={handleRemindLater}
        onDismiss={handleDismiss}
      />

      <PasswordSetupDialog
        open={showPasswordSetup}
        onComplete={handlePasswordSetupComplete}
        onCancel={handlePasswordSetupCancel}
      />

      <UnlockDialog
        open={showUnlock}
        onUnlock={handleUnlock}
        error={unlockError}
      />
    </>
  );
}
