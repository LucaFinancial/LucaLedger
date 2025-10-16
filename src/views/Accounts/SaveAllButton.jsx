import { Button } from '@mui/material';
import { useSelector } from 'react-redux';

import { selectors } from '@/store/accountsLegacy';
import { saveAllAccounts } from '@/store/accountsLegacy/actions';

export default function SaveAllButton() {
  const accounts = useSelector(selectors.selectAccounts);

  const handleClick = () => {
    saveAllAccounts(accounts);
  };

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={handleClick}
    >
      Save Legacy Format
    </Button>
  );
}
