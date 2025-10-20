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
  clearActiveDEK,
  getActiveDEK,
} from '@/crypto/keyManager';
import {
  hasEncryptedData,
  batchStoreEncryptedRecords,
  clearAllData,
  getAllEncryptedRecords,
} from '@/crypto/database';
import { addAccount } from '@/store/accounts/slice';
import { addTransaction } from '@/store/transactions/slice';

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

  // Get Redux state for migration
  const selectAccounts = (state) => state.accounts;
  const selectTransactions = (state) => state.transactions;
  const accounts = useSelector(selectAccounts);
  const transactions = useSelector(selectTransactions);

  useEffect(() => {
    const checkStatus = async () => {
      const hasEncrypted = await hasEncryptedData();
      const hasLocalStorage = localStorage.getItem('reduxState');

      if (hasEncrypted) {
        // Data is encrypted, need to unlock
        dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTED));

        // Check if we have a valid session token
        if (hasValidSessionToken()) {
          // Try to restore session (will need password validation elsewhere)
          dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
          setShowUnlock(true);
        } else {
          dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
          setShowUnlock(true);
        }
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

      // Clear localStorage
      localStorage.removeItem('reduxState');

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

  const handleUnlock = async (password, stayLoggedIn) => {
    try {
      setUnlockError(null);
      setMigrating(true);

      // Unlock encryption (this sets the active DEK)
      const { expiresAt } = await unlockEncryption(password, stayLoggedIn);

      // Get the DEK that was just set by unlockEncryption
      const dek = getActiveDEK();
      if (dek) {
        // Load encrypted data into Redux
        const [encryptedAccounts, encryptedTransactions] = await Promise.all([
          getAllEncryptedRecords('accounts', dek),
          getAllEncryptedRecords('transactions', dek),
        ]);

        // Load accounts in batches to avoid blocking UI
        for (const account of encryptedAccounts) {
          dispatch(addAccount(account));
          // Small delay to prevent UI freezing with large datasets
          if (encryptedAccounts.length > 100) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        // Load transactions in batches to avoid blocking UI
        for (const transaction of encryptedTransactions) {
          dispatch(addTransaction(transaction));
          // Small delay to prevent UI freezing with large datasets
          if (encryptedTransactions.length > 1000) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }
      }

      // Update auth status
      dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
      if (expiresAt) {
        dispatch(setSessionExpiresAt(expiresAt));
      }

      setMigrating(false);
      setShowUnlock(false);
    } catch (error) {
      console.error('Unlock failed:', error);
      setUnlockError('Incorrect password. Please try again.');
      setMigrating(false);
    }
  };

  const migrateDataToEncrypted = async (dek) => {
    // Prepare accounts and transactions for batch encryption
    const accountRecords = accounts.map((account) => ({
      id: account.id,
      data: account,
    }));

    const transactionRecords = transactions.map((transaction) => ({
      id: transaction.id,
      data: transaction,
    }));

    // Batch encrypt and store
    await batchStoreEncryptedRecords('accounts', accountRecords, dek);
    await batchStoreEncryptedRecords('transactions', transactionRecords, dek);
  };

  // Show migration progress
  if (migrating) {
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
          Encrypting your data...
        </Typography>
        <Typography
          variant='body2'
          sx={{ mt: 1, color: 'white' }}
        >
          This may take a moment. Please do not close the app.
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
