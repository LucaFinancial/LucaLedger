/**
 * Import Data Button Component
 * Allows users to import encrypted data backups
 */

import { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';

import { useAuth } from '@/auth';
import {
  importEncryptedData,
  validateImportedData,
} from '@/crypto/exportImport';
import { actions as accountActions } from '@/store/accounts';

export default function ImportDataButton() {
  const { activeDEK } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);
  const [importMetadata, setImportMetadata] = useState(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    event.target.value = '';

    setIsImporting(true);
    setProgress(0);
    setError(null);

    try {
      // Read file
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      setProgress(10);

      // Import and decrypt
      const importedData = await importEncryptedData(fileContent, activeDEK, {
        onProgress: (percent) => setProgress(percent),
      });

      // Validate imported data
      const validation = validateImportedData(importedData);
      if (!validation.valid) {
        throw new Error(
          `Invalid data structure: ${validation.errors.join(', ')}`
        );
      }

      // Store for confirmation
      setPendingImportData(importedData);
      setImportMetadata(importedData.importMetadata);
      setShowConfirmDialog(true);
      setIsImporting(false);
      setProgress(0);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.message || 'Failed to import data');
      setIsImporting(false);
      setProgress(0);
    }
  };

  const handleConfirmImport = async () => {
    setShowConfirmDialog(false);

    if (!pendingImportData) {
      setError('No data to import');
      return;
    }

    try {
      // Load the data into Redux store
      // This will replace existing data
      const { accounts, transactions, categories } = pendingImportData;

      // Dispatch actions to load data
      // Note: Using loadAccount action which handles both accounts and transactions
      if (accounts && transactions) {
        await dispatch(
          accountActions.loadAccount(
            {
              accounts,
              transactions,
              categories: categories || {},
            },
            true
          ) // true = overwrite categories
        );
      }

      setPendingImportData(null);
      setImportMetadata(null);
    } catch (err) {
      console.error('Failed to load imported data:', err);
      setError(err.message || 'Failed to load imported data');
    }
  };

  const handleCancelImport = () => {
    setShowConfirmDialog(false);
    setPendingImportData(null);
    setImportMetadata(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Button
        variant='contained'
        color='secondary'
        onClick={handleImportClick}
        disabled={isImporting || !activeDEK}
        startIcon={<UploadIcon />}
        fullWidth
      >
        {isImporting ? 'Importing...' : 'Import Encrypted Backup'}
      </Button>

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept='.json'
        style={{ display: 'none' }}
      />

      {/* Import Progress */}
      {isImporting && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant='determinate'
            value={progress}
          />
          <Typography
            variant='caption'
            sx={{ mt: 1, display: 'block', textAlign: 'center' }}
          >
            Importing: {progress}%
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert
          severity='error'
          onClose={handleCloseError}
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelImport}
      >
        <DialogTitle>Confirm Import</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to import a backup and restore your data. This will
            replace all your current accounts, transactions, and categories.
          </DialogContentText>
          {importMetadata && (
            <>
              <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
                Backup Information:
              </DialogContentText>
              <DialogContentText
                component='ul'
                sx={{ mt: 1, pl: 2 }}
              >
                <li>
                  Exported:{' '}
                  {new Date(importMetadata.exportedAt).toLocaleString()}
                </li>
                <li>Schema Version: {importMetadata.schemaVersion}</li>
                <li>Format Version: {importMetadata.formatVersion}</li>
              </DialogContentText>
            </>
          )}
          <DialogContentText
            sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}
          >
            Warning: This action cannot be undone!
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            Consider exporting a backup of your current data before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelImport}>Cancel</Button>
          <Button
            onClick={handleConfirmImport}
            variant='contained'
            color='error'
          >
            Replace Data
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
