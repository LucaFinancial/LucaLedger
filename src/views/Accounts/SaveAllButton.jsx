import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/accounts';

export default function SaveAllButton() {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(actions.saveAllAccounts());
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
