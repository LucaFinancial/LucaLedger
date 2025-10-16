import { Button } from '@mui/material';
import { useSelector } from 'react-redux';

import { selectors } from '@/store/accountsLegacy';
import { saveAllAccounts } from '@/store/accountsLegacy/actions';

export default function SaveLegacyButton() {
  const accounts = useSelector(selectors.selectAccounts);

  const handleClick = () => {
    saveAllAccounts(accounts);
  };

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={handleClick}
    >
      Save Legacy Format
    </Button>
  );
}
