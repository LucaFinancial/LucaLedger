import { Box, Button, CircularProgress } from '@mui/material';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '@/store/accounts';
import CategoryImportConfirmModal from '@/components/CategoryImportConfirmModal';

export default function LoadButton() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const loading = useSelector(selectors.selectAccountsLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [categoriesCount, setCategoriesCount] = useState(0);

  const handleChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result);

        // Check if the file contains categories
        if (json.categories && Object.keys(json.categories).length > 0) {
          // Store the data and show confirmation modal
          setPendingData(json);
          setCategoriesCount(Object.keys(json.categories).length);
          setModalOpen(true);
        } else {
          // No categories, load directly
          await dispatch(actions.loadAccount(json));
        }
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

  const handleConfirmLoad = async () => {
    if (pendingData) {
      setModalOpen(false);
      await dispatch(actions.loadAccount(pendingData, true)); // true = overwrite categories
      setPendingData(null);
      setCategoriesCount(0);
    }
  };

  const handleCancelLoad = () => {
    if (pendingData) {
      // Load without categories
      setModalOpen(false);
      dispatch(actions.loadAccount(pendingData, false)); // false = don't overwrite categories
      setPendingData(null);
      setCategoriesCount(0);
    }
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
          loading ? <CircularProgress size={20} color='inherit' /> : null
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

      <CategoryImportConfirmModal
        open={modalOpen}
        onConfirm={handleConfirmLoad}
        onCancel={handleCancelLoad}
        categoriesCount={categoriesCount}
      />
    </Box>
  );
}
