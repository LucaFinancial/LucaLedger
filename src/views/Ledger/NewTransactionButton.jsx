import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions } from '@/store/transactions';

export default function NewTransactionButton({ compact = false }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();

  const handleClick = () => {
    dispatch(actions.createNewTransaction(accountId));
  };

  if (compact) {
    return (
      <Button
        variant='contained'
        onClick={handleClick}
        startIcon={<Add />}
        size='small'
      >
        New
      </Button>
    );
  }

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

NewTransactionButton.propTypes = {
  compact: PropTypes.bool,
};
