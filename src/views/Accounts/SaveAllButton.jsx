import { Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from '@/store/accountsLegacy';
import { selectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';

export default function SaveAllButton() {
  const dispatch = useDispatch();
  const accounts = useSelector(selectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);

  const handleClick = () => {
    // Combine accounts with their transactions for saving
    const accountsWithTransactions = accounts.map((account) => ({
      ...account,
      transactions: allTransactions.filter((t) => t.accountId === account.id),
    }));
    dispatch(actions.saveAllAccounts(accountsWithTransactions));
  };

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={handleClick}
    >
      Save All Accounts
    </Button>
  );
}
