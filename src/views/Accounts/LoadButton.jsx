import { Box, Button, CircularProgress } from '@mui/material';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '@/store/accounts';

export default function LoadButton() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const loading = useSelector(selectors.selectAccountsLoading);

  const handleChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result);
        await dispatch(actions.loadAccount(json));
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Failed to load file. Please ensure it is a valid JSON file.');
      }
    };
    reader.onerror = () => {
      console.error('Error reading file:', reader.error);
      alert('Failed to read file. Please try again.');
    };
    reader.readAsText(file);

    // Reset the input so the same file can be loaded again
    event.target.value = '';
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
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress
              size={20}
              color='inherit'
            />
          ) : null
        }
      >
        {loading ? 'Loading...' : 'Load Accounts'}
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
