import { Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '@/store/accounts';

export default function CreateNewButton() {
  const dispatch = useDispatch();
  const loading = useSelector(selectors.selectAccountsLoading);

  const handleCreateAccount = () => {
    dispatch(actions.createNewAccount());
  };

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={handleCreateAccount}
      disabled={loading}
    >
      Create New Account
    </Button>
  );
}
