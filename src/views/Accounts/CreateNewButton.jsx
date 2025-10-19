import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/accounts';

export default function CreateNewButton() {
  const dispatch = useDispatch();
  const handleCreateAccount = () => {
    dispatch(actions.createNewAccount());
  };

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={handleCreateAccount}
    >
      Create New Account
    </Button>
  );
}
