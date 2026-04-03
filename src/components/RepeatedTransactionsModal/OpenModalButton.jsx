import { Button } from '@mui/material';

export default function OpenModalButton({ handleOpen }) {
  return (
    <Button variant='outlined' color='primary' fullWidth onClick={handleOpen}>
      Create Repeated Transactions
    </Button>
  );
}

