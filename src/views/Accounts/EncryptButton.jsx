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
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import {
  setLoading as setAccountsLoading,
  addLoadingAccountId,
  clearLoadingAccountIds,
} from '@/store/accounts/slice';
import { initializeEncryption, clearActiveDEK } from '@/crypto/keyManager';
import { batchStoreEncryptedRecords, clearAllData } from '@/crypto/database';
import categoriesData from '@/config/categories.json';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

export default function EncryptButton() {
  const dispatch = useDispatch();
  const encryptionStatus = useSelector(
    encryptionSelectors.selectEncryptionStatus,
  );
  const dismissUntil = useSelector(encryptionSelectors.selectDismissUntil);
  const accountsLoading = useSelector(accountSelectors.selectAccountsLoading);

  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Get Redux state for migration using proper selectors
  const accounts = useSelector(accountSelectors.selectAccounts);
  const transactions = useSelector(transactionSelectors.selectTransactions);
  const categories = useSelector(categorySelectors.selectAllCategories);

  // Show button if encryption is not enabled and there's data to encrypt
  // Either the prompt was dismissed OR there's actual data in the system
  const hasData = accounts.length > 0 || transactions.length > 0;
  const shouldShow =
    encryptionStatus === EncryptionStatus.UNENCRYPTED &&
    (dismissUntil || hasData);

  const handleClick = () => {
    setShowPasswordSetup(true);
  };

  const handlePasswordSetupComplete = async (password, stayLoggedIn) => {
    setShowPasswordSetup(false);
    setMigrating(true);

    try {
      dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTING));

      // Show loading indicators on all account cards
      dispatch(setAccountsLoading(true));
      dispatch(clearLoadingAccountIds());
      accounts.forEach((account) => {
        dispatch(addLoadingAccountId(account.id));
      });

      // Initialize encryption and get DEK
      const { dek, expiresAt } = await initializeEncryption(
        password,
        stayLoggedIn,
      );

      // Migrate data from localStorage to IndexedDB
      await migrateDataToEncrypted(dek);

      // Set schema version for encrypted storage
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);

      // Clear localStorage
      localStorage.removeItem('reduxState');

      // Update encryption status
      dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
      localStorage.setItem('encryptionActive', 'true');
      if (expiresAt) {
        dispatch(setSessionExpiresAt(expiresAt));
      }

      // Clear loading indicators
      dispatch(clearLoadingAccountIds());
      dispatch(setAccountsLoading(false));
      setMigrating(false);
    } catch (error) {
      console.error('Encryption setup failed:', error);
      dispatch(setError('Failed to set up encryption: ' + error.message));
      dispatch(clearLoadingAccountIds());
      dispatch(setAccountsLoading(false));
      setMigrating(false);

      // Rollback
      await clearAllData();
      clearActiveDEK();
      localStorage.removeItem('encryptionActive');
      dispatch(setEncryptionStatus(EncryptionStatus.UNENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
    }
  };

  const handlePasswordSetupCancel = () => {
    setShowPasswordSetup(false);
  };

  const migrateDataToEncrypted = async (dek) => {
    // Ensure accounts, transactions, and categories are arrays (defensive check)
    const accountsArray = Array.isArray(accounts) ? accounts : [];
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    const categoriesToMigrate =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : categoriesData.categories;

    // Prepare accounts, transactions, and categories for batch encryption
    const accountRecords = accountsArray.map((account) => ({
      id: account.id,
      data: account,
    }));

    const transactionRecords = transactionsArray.map((transaction) => ({
      id: transaction.id,
      data: transaction,
    }));

    const categoryRecords = categoriesToMigrate.map((category) => ({
      id: category.id,
      data: category,
    }));

    // Batch encrypt and store
    await batchStoreEncryptedRecords('accounts', accountRecords, dek);
    await batchStoreEncryptedRecords('transactions', transactionRecords, dek);
    await batchStoreEncryptedRecords('categories', categoryRecords, dek);

    console.log(
      `Migrated ${accountsArray.length} accounts, ${transactionsArray.length} transactions, and ${categoriesToMigrate.length} categories to encrypted storage`,
    );
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
        disabled={migrating || accountsLoading}
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
