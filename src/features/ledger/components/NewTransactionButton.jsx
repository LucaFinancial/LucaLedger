import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions } from '@/store/transactions';

export default function NewTransactionButton() {
  const dispatch = useDispatch();
  const { accountId } = useParams();

  const handleClick = () => {
    dispatch(actions.createNewTransaction(accountId));
  };

  return (
    <Button
      variant='contained'
      onClick={handleClick}
      fullWidth
    >
      Add new transaction
    </Button>
  );
}
