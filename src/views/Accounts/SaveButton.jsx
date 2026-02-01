import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { selectors as statementSelectors } from '@/store/statements';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

export default function SaveButton() {
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
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const loading = useSelector(accountSelectors.selectAccountsLoading);

  const handleSave = () => {
    const data = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      accounts,
      transactions,
      categories,
      statements,
      recurringTransactions,
      recurringTransactionEvents,
      transactionSplits,
    };

    const saveString = JSON.stringify(data, null, 2);
    const saveBlob = new Blob([saveString], { type: 'application/json' });
    const url = URL.createObjectURL(saveBlob);
    const link = document.createElement('a');
    link.download = `${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={handleSave}
      disabled={loading}
    >
      Save Accounts
    </Button>
  );
}
