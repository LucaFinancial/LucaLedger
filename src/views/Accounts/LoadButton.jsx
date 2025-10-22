import { Box, Button, Snackbar, Alert } from '@mui/material';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/accounts';
import FileLoadingModal from '@/components/FileLoadingModal';
import useFileLoader from '@/hooks/useFileLoader';

export default function LoadButton() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const { loading, progress, phase, loadFile, cancelLoad } = useFileLoader();

  const handleChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset file input
    event.target.value = '';

    try {
      await loadFile(file, (data) => {
        // Dispatch action with loaded data
        dispatch(actions.loadAccount(data));
      });
    } catch (error) {
      // Only show error if not cancelled
      if (error.message !== 'Cancelled by user') {
        setErrorMessage(error.message || 'Failed to load file');
      }
    }
  };

  const handleCancel = () => {
    cancelLoad();
  };

  const handleLoadAccountsClick = () => {
    fileInputRef.current.click();
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  return (
    <Box>
      <Button
        variant='contained'
        color='primary'
        onClick={handleLoadAccountsClick}
        disabled={loading}
      >
        Load Accounts
      </Button>
      <input
        type='file'
        id='fileInput'
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
        accept='.json'
      />
      <FileLoadingModal
        open={loading}
        progress={progress}
        phase={phase}
        onCancel={handleCancel}
        isDeterminate={true}
      />
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity='error'
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
