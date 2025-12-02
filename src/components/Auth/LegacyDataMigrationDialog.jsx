/**
 * Legacy Data Migration Dialog
 * Prompts user to export their data before it's deleted
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

export default function LegacyDataMigrationDialog({ onComplete }) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Get data from localStorage
      const reduxStateRaw = localStorage.getItem('reduxState');
      if (!reduxStateRaw) {
        setExported(true);
        setExporting(false);
        return;
      }

      const state = JSON.parse(reduxStateRaw);

      // Prepare export data
      const accounts =
        state.accounts?.data ||
        (Array.isArray(state.accounts) ? state.accounts : []);
      const transactions = state.transactions || [];
      const categories = state.categories || [];

      const data = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        accounts,
        transactions,
        categories,
        exportedAt: new Date().toISOString(),
        note: 'Legacy data export before migration to encrypted storage',
      };

      // Trigger download
      const saveString = JSON.stringify(data, null, 2);
      const saveBlob = new Blob([saveString], { type: 'application/json' });
      const url = URL.createObjectURL(saveBlob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `luca-ledger-legacy-export-${timestamp}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setExported(true);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Clear all legacy localStorage data
      localStorage.removeItem('reduxState');
      localStorage.removeItem('encryptionActive');
      localStorage.removeItem('encryptionPromptDismissUntil');
      localStorage.removeItem('dataSchemaVersion');

      onComplete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={true}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color='warning' />
        Legacy Data Detected
      </DialogTitle>
      <DialogContent>
        <Alert
          severity='warning'
          sx={{ mb: 2 }}
        >
          <Typography variant='body2'>
            <strong>Action Required:</strong> We found unencrypted financial
            data stored in your browser. For your security, Luca Ledger now
            requires all data to be encrypted.
          </Typography>
        </Alert>

        <Typography
          variant='body1'
          sx={{ mb: 2 }}
        >
          To continue, you must:
        </Typography>

        <Box
          component='ol'
          sx={{ pl: 2, mb: 2 }}
        >
          <Typography
            component='li'
            variant='body2'
            sx={{ mb: 1 }}
          >
            <strong>Export your data</strong> - Download a backup of your
            existing accounts and transactions.
          </Typography>
          <Typography
            component='li'
            variant='body2'
            sx={{ mb: 1 }}
          >
            <strong>Create an account</strong> - Register with a username and
            password to encrypt your data.
          </Typography>
          <Typography
            component='li'
            variant='body2'
          >
            <strong>Import your data</strong> - Load your exported file into
            your new encrypted account.
          </Typography>
        </Box>

        <Alert
          severity='error'
          sx={{ mb: 2 }}
        >
          <Typography variant='body2'>
            The unencrypted data will be permanently deleted after this process.
            Make sure to save your export file in a safe location.
          </Typography>
        </Alert>

        {exported && (
          <Alert
            severity='success'
            sx={{ mb: 2 }}
          >
            <Typography variant='body2'>
              Data exported successfully! You can now proceed to delete the
              legacy data and create your encrypted account.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleExport}
          variant='contained'
          startIcon={
            exporting ? <CircularProgress size={20} /> : <DownloadIcon />
          }
          disabled={exporting || exported}
        >
          {exporting ? 'Exporting...' : exported ? 'Exported' : 'Export Data'}
        </Button>
        <Button
          onClick={handleDelete}
          variant='contained'
          color='error'
          startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          disabled={!exported || deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Legacy Data & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LegacyDataMigrationDialog.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
