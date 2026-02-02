import { Box, Button, CircularProgress } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '@/store/accounts';
import CategoryImportConfirmModal from '@/components/CategoryImportConfirmModal';
import ValidationErrorsDialog from '@/components/ValidationErrorsDialog';
import {
  processLoadedData,
  removeInvalidObjects,
} from '@/utils/dataProcessing';
import { downloadValidationErrorsJson } from '@/utils/validationErrorsJson';

export default function LoadButton() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const loading = useSelector(selectors.selectAccountsLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [validationState, setValidationState] = useState({
    open: false,
    errors: [],
  });
  const validationResolveRef = useRef(null);

  const openValidationDialog = useCallback((errors) => {
    return new Promise((resolve) => {
      validationResolveRef.current = resolve;
      setValidationState({ open: true, errors });
    });
  }, []);

  const closeValidationDialog = useCallback((action) => {
    if (validationResolveRef.current) {
      validationResolveRef.current(action);
    }
    validationResolveRef.current = null;
    setValidationState({ open: false, errors: [] });
  }, []);

  const runValidationFlow = useCallback(
    async (result, schemaVersion) => {
      let current = result;

      while (current.errors.length > 0) {
        const action = await openValidationDialog(current.errors);

        if (action === 'apply-defaults') {
          current = processLoadedData(current.data, {
            schemaVersion,
            applyDefaults: true,
          });
          continue;
        }

        if (action === 'remove-invalid') {
          const removal = removeInvalidObjects(current.data, current.errors);
          current = processLoadedData(removal.data, { schemaVersion });
          continue;
        }

        return null;
      }

      return current;
    },
    [openValidationDialog],
  );

  const processAndLoad = useCallback(
    async (rawData, shouldOverwriteCategories) => {
      try {
        const result = processLoadedData(rawData, {
          schemaVersion: rawData.schemaVersion,
        });

        const resolved = await runValidationFlow(result, rawData.schemaVersion);
        if (!resolved) {
          return;
        }

        await dispatch(
          actions.loadData(resolved.data, shouldOverwriteCategories),
        );
      } catch (error) {
        console.error('Error processing file:', error);
        dispatch(
          actions.setError(
            error.message || 'Failed to load file. Please try again.',
          ),
        );
      }
    },
    [dispatch, runValidationFlow],
  );

  const handleChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result);

        // Check if the file contains categories
        if (Array.isArray(json.categories) && json.categories.length > 0) {
          // Store the data and show confirmation modal
          setPendingData(json);
          setCategoriesCount(json.categories.length);
          setModalOpen(true);
        } else {
          // No categories, load directly
          await processAndLoad(json, false);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        dispatch(
          actions.setError(
            'Failed to load file. Please ensure it is a valid JSON file.',
          ),
        );
      }
    };
    reader.onerror = () => {
      console.error('Error reading file:', reader.error);
      dispatch(actions.setError('Failed to read file. Please try again.'));
    };
    reader.readAsText(file);

    // Reset the input so the same file can be loaded again
    event.target.value = '';
  };

  const handleConfirmLoad = async () => {
    if (pendingData) {
      setModalOpen(false);
      await processAndLoad(pendingData, true); // true = overwrite categories
      setPendingData(null);
      setCategoriesCount(0);
    }
  };

  const handleCancelLoad = async () => {
    if (pendingData) {
      // Load without categories
      setModalOpen(false);
      await processAndLoad(pendingData, false); // false = don't overwrite categories
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
      <ValidationErrorsDialog
        open={validationState.open}
        errors={validationState.errors}
        onDownloadJson={() =>
          downloadValidationErrorsJson(validationState.errors)
        }
        onApplyDefaults={() => closeValidationDialog('apply-defaults')}
        onRemoveInvalid={() => closeValidationDialog('remove-invalid')}
        onCancel={() => closeValidationDialog('cancel')}
      />
    </Box>
  );
}
