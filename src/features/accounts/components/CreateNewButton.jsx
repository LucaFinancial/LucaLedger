import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';

import { createNewAccount } from '../store/actions';

export default function CreateNewAccountButton() {
  const dispatch = useDispatch();

  const handleCreateAccount = () => {
    dispatch(createNewAccount('test', 'test account description'));
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
