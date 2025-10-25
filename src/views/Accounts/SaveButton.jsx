import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';

export default function SaveButton() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const transactions = useSelector(transactionSelectors.selectTransactions);
  const loading = useSelector(accountSelectors.selectAccountsLoading);

  const handleSave = () => {
    const data = {
      schemaVersion: '2.0.1',
      accounts,
      transactions,
    };

    const saveString = JSON.stringify(data, null, 2);
    const saveBlob = new Blob([saveString], { type: 'application/json' });
    const url = URL.createObjectURL(saveBlob);
    const link = document.createElement('a');
    link.download = `${dayjs().format('YYYY-MM-DD')}.json`;
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
