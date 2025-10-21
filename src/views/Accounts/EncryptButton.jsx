import { Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PasswordSetupDialog } from '@/components/EncryptionSetup';
import {
  selectors as encryptionSelectors,
  EncryptionStatus,
  setEncryptionStatus,
  setAuthStatus,
  setSessionExpiresAt,
  setError,
  AuthStatus,
} from '@/store/encryption';
import { initializeEncryption, clearActiveDEK } from '@/crypto/keyManager';
import { batchStoreEncryptedRecords, clearAllData } from '@/crypto/database';

export default function EncryptButton() {
  const dispatch = useDispatch();
  const encryptionStatus = useSelector(
    encryptionSelectors.selectEncryptionStatus
  );
  const promptDismissedAt = useSelector(
    encryptionSelectors.selectPromptDismissedAt
  );

  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Get Redux state for migration
  const selectAccounts = (state) => state.accounts;
  const selectTransactions = (state) => state.transactions;
  const accounts = useSelector(selectAccounts);
  const transactions = useSelector(selectTransactions);

  // Show button if encryption is not enabled and there's data to encrypt
  // Either the prompt was dismissed OR there's actual data in the system
  const hasData = accounts.length > 0 || transactions.length > 0;
  const shouldShow =
    encryptionStatus === EncryptionStatus.UNENCRYPTED &&
    (promptDismissedAt || hasData);

  const handleClick = () => {
    setShowPasswordSetup(true);
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

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <Button
        variant='contained'
        color='warning'
        startIcon={<LockIcon />}
        onClick={handleClick}
        disabled={migrating}
        sx={{ minWidth: '150px' }}
      >
        {migrating ? 'Encrypting...' : 'Encrypt Data'}
      </Button>

      <PasswordSetupDialog
        open={showPasswordSetup}
        onComplete={handlePasswordSetupComplete}
        onCancel={handlePasswordSetupCancel}
      />
    </>
  );
}
