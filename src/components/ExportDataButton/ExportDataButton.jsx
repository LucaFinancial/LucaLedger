/**
 * Export Data Button Component
 * Allows users to export encrypted data backups
 */

import { useState } from 'react';
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
import { Download as DownloadIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';

import { useAuth } from '@/auth';
import { exportEncryptedData } from '@/crypto/exportImport';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';

export default function ExportDataButton() {
  const { activeDEK, currentUser } = useAuth();
  const accounts = useSelector(accountSelectors.selectAccounts);
  const transactions = useSelector(transactionSelectors.selectTransactions);
  const categories = useSelector(categorySelectors.selectAllCategories);

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleExportClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmExport = async () => {
    setShowConfirmDialog(false);
    setIsExporting(true);
    setProgress(0);
    setError(null);

    try {
      // Gather data to export
      const userData = {
        accounts,
        transactions,
        categories,
      };

      // Export with progress tracking
      const blob = await exportEncryptedData(userData, activeDEK, {
        onProgress: (percent) => setProgress(percent),
      });

      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const username = currentUser?.username || 'user';
      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
      link.download = `luca-ledger-backup-${username}-${timestamp}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setProgress(0);
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.message || 'Failed to export data');
      setIsExporting(false);
      setProgress(0);
    }
  };

  const handleCancelExport = () => {
    setShowConfirmDialog(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        onClick={handleExportClick}
        disabled={isExporting || !activeDEK}
        startIcon={<DownloadIcon />}
        fullWidth
      >
        {isExporting ? 'Exporting...' : 'Export Encrypted Backup'}
      </Button>

      {/* Export Progress */}
      {isExporting && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant='determinate'
            value={progress}
          />
          <Typography
            variant='caption'
            sx={{ mt: 1, display: 'block', textAlign: 'center' }}
          >
            Exporting: {progress}%
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
        onClose={handleCancelExport}
      >
        <DialogTitle>Export Encrypted Backup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create an encrypted backup of all your accounts,
            transactions, and categories. The backup file will be encrypted with
            your current encryption key.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
            Important:
          </DialogContentText>
          <DialogContentText
            component='ul'
            sx={{ mt: 1, pl: 2 }}
          >
            <li>
              The backup can only be restored with the same password/encryption
              key
            </li>
            <li>Store the backup file in a secure location</li>
            <li>You will need this backup if you lose access to your data</li>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelExport}>Cancel</Button>
          <Button
            onClick={handleConfirmExport}
            variant='contained'
            color='primary'
          >
            Export Backup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
