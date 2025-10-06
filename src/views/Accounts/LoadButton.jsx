import { Box, Button } from '@mui/material';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/accountsLegacy';

export default function LoadButton() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const json = JSON.parse(reader.result);
      dispatch(actions.loadAccount(json));
    };
    reader.readAsText(file);
  };

  const handleLoadAccountsClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Box>
      <Button
        variant='contained'
        color='primary'
        onClick={handleLoadAccountsClick}
      >
        Load Accounts
      </Button>
      <input
        type='file'
        id='fileInput'
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
        multiple
      />
    </Box>
  );
}
