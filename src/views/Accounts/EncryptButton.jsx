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
  setError,
  AuthStatus,
} from '@/store/encryption';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { selectors as statementSelectors } from '@/store/statements';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import { selectors as recurringTransactionLinkSelectors } from '@/store/recurringTransactionLinks';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { selectors as transactionLinkSelectors } from '@/store/transactionLinks';
import {
  setLoading as setAccountsLoading,
  addLoadingAccountId,
  clearLoadingAccountIds,
} from '@/store/accounts/slice';
import { initializeEncryption, clearActiveDEK } from '@/crypto/keyManager';
import { batchStoreEncryptedRecords, clearAllData } from '@/crypto/database';
import { getDefaultCategories } from '@/utils/defaultCategories';

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
  const statements = useSelector(statementSelectors.selectStatements);
  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactions,
  );
  const recurringTransactionEvents = useSelector(
    recurringTransactionEventSelectors.selectRecurringTransactionEvents,
  );
  const recurringTransactionLinks = useSelector(
    recurringTransactionLinkSelectors.selectRecurringTransactionLinks,
  );
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const transactionLinks = useSelector(
    transactionLinkSelectors.selectTransactionLinks,
  );

  // Show button if encryption is not enabled and there's data to encrypt
  // Either the prompt was dismissed OR there's actual data in the system
  const hasData = accounts.length > 0 || transactions.length > 0;
  const shouldShow =
    encryptionStatus === EncryptionStatus.UNENCRYPTED &&
    (dismissUntil || hasData);

  const handleClick = () => {
    setShowPasswordSetup(true);
  };

  const handlePasswordSetupComplete = async (password) => {
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
      const { dek } = await initializeEncryption(password);

      // Migrate data from localStorage to IndexedDB
      await migrateDataToEncrypted(dek);

      // Clear localStorage
      localStorage.removeItem('reduxState');

      // Update encryption status
      dispatch(setEncryptionStatus(EncryptionStatus.ENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
      localStorage.setItem('encryptionActive', 'true');

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
    // Ensure collections are arrays (defensive check)
    const accountsArray = Array.isArray(accounts) ? accounts : [];
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    const categoriesToMigrate =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : getDefaultCategories();
    const statementsArray = Array.isArray(statements) ? statements : [];
    const recurringTransactionsArray = Array.isArray(recurringTransactions)
      ? recurringTransactions
      : [];
    const recurringTransactionEventsArray = Array.isArray(
      recurringTransactionEvents,
    )
      ? recurringTransactionEvents
      : [];
    const recurringTransactionLinksArray = Array.isArray(
      recurringTransactionLinks,
    )
      ? recurringTransactionLinks
      : [];
    const transactionSplitsArray = Array.isArray(transactionSplits)
      ? transactionSplits
      : [];
    const transactionLinksArray = Array.isArray(transactionLinks)
      ? transactionLinks
      : [];

    // Prepare collections for batch encryption
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
    const statementRecords = statementsArray.map((statement) => ({
      id: statement.id,
      data: statement,
    }));
    const recurringTransactionRecords = recurringTransactionsArray.map((rule) => ({
      id: rule.id,
      data: rule,
    }));
    const recurringTransactionEventRecords =
      recurringTransactionEventsArray.map((event) => ({
        id: event.id,
        data: event,
      }));
    const recurringTransactionLinkRecords =
      recurringTransactionLinksArray.map((link) => ({
        id: link.id,
        data: link,
      }));
    const transactionSplitRecords = transactionSplitsArray.map((split) => ({
      id: split.id,
      data: split,
    }));
    const transactionLinkRecords = transactionLinksArray.map((link) => ({
      id: link.id,
      data: link,
    }));

    // Batch encrypt and store
    await batchStoreEncryptedRecords('accounts', accountRecords, dek);
    await batchStoreEncryptedRecords('transactions', transactionRecords, dek);
    await batchStoreEncryptedRecords('categories', categoryRecords, dek);
    await batchStoreEncryptedRecords('statements', statementRecords, dek);
    await batchStoreEncryptedRecords(
      'recurringTransactions',
      recurringTransactionRecords,
      dek,
    );
    await batchStoreEncryptedRecords(
      'recurringTransactionEvents',
      recurringTransactionEventRecords,
      dek,
    );
    await batchStoreEncryptedRecords(
      'recurringTransactionLinks',
      recurringTransactionLinkRecords,
      dek,
    );
    await batchStoreEncryptedRecords(
      'transactionSplits',
      transactionSplitRecords,
      dek,
    );
    await batchStoreEncryptedRecords('transactionLinks', transactionLinkRecords, dek);

    console.log(
      `Migrated ${accountsArray.length} accounts, ${transactionsArray.length} transactions, ${categoriesToMigrate.length} categories, ${statementsArray.length} statements, ${recurringTransactionsArray.length} recurring rules, ${recurringTransactionEventsArray.length} recurring events, ${recurringTransactionLinksArray.length} recurring links, ${transactionSplitsArray.length} splits, and ${transactionLinksArray.length} transaction links to encrypted storage`,
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
