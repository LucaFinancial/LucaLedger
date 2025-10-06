import { Button } from '@mui/material';
import { useSelector } from 'react-redux';

import { selectors } from '@/store/accounts';

export default function SaveNewFormatButton() {
  const accounts = useSelector(selectors.selectAccounts);
  const transactions = useSelector(selectors.selectTransactions);

  const handleSave = () => {
    const data = {
      version: '2.0.0',
      accounts,
      transactions,
    };

    const saveString = JSON.stringify(data, null, 2);
    const saveBlob = new Blob([saveString], { type: 'application/json' });
    const url = URL.createObjectURL(saveBlob);
    const link = document.createElement('a');
    link.download = 'luca-ledger-unified.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={handleSave}
    >
      Save New Format
    </Button>
  );
}
