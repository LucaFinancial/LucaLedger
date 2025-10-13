import { Button } from '@mui/material';
import { useSelector } from 'react-redux';

import { actions } from '@/store/accountsLegacy';
import { selectors } from '@/store/accounts';

export default function SaveAllButton() {
  const accounts = useSelector(selectors.selectAccountsWithTransactions);

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={() => actions.saveAllAccounts(accounts)}
    >
      Save All Accounts
    </Button>
  );
}
