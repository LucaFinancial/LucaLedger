import { Button } from '@mui/material';
import { useSelector } from 'react-redux';

import { actions, selectors } from '@/store/accountsLegacy';

export default function SaveAllButton() {
  const accounts = useSelector(selectors.selectAccounts);

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
