import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PasswordSetupDialog } from '@/components/EncryptionSetup';
import {
  EncryptionStatus as EncryptionStatusEnum,
  selectors as encryptionSelectors,
  setEncryptionStatus,
  setAuthStatus,
  setSessionExpiresAt,
  setError,
  AuthStatus,
} from '@/store/encryption';
import { initializeEncryption, clearActiveDEK } from '@/crypto/keyManager';
import { batchStoreEncryptedRecords, clearAllData } from '@/crypto/database';
import { version } from '../../../package.json';

// This should match the SchemaVersionProvider constant
const CURRENT_SCHEMA_VERSION = '2.0.1';

export default function Settings() {
  const dispatch = useDispatch();
  const status = useSelector(encryptionSelectors.selectEncryptionStatus);
  const isAuthenticated = useSelector(
    encryptionSelectors.selectIsAuthenticated
  );

  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Get Redux state for migration
  const selectAccounts = (state) => state.accounts;
  const selectTransactions = (state) => state.transactions;
  const accounts = useSelector(selectAccounts);
  const transactions = useSelector(selectTransactions);

  const getEncryptionStatusDisplay = () => {
    switch (status) {
      case EncryptionStatusEnum.ENCRYPTED:
        return {
          label: 'Encrypted',
          icon: <LockIcon />,
          color: 'success',
          description: isAuthenticated
            ? 'Your data is encrypted and you are logged in'
            : 'Your data is encrypted',
        };
      case EncryptionStatusEnum.ENCRYPTING:
        return {
          label: 'Encrypting...',
          icon: <LockIcon />,
          color: 'warning',
          description: 'Encryption in progress',
        };
      case EncryptionStatusEnum.UNENCRYPTED:
      default:
        return {
          label: 'Unencrypted',
          icon: <LockOpenIcon />,
          color: 'default',
          description: 'Your data is not encrypted',
        };
    }
  };

  const encryptionConfig = getEncryptionStatusDisplay();

  const handleEncryptClick = () => {
    setShowPasswordSetup(true);
  };

  const handlePasswordSetupComplete = async (password, stayLoggedIn) => {
    setShowPasswordSetup(false);
    setMigrating(true);

    try {
      dispatch(setEncryptionStatus(EncryptionStatusEnum.ENCRYPTING));

      // Initialize encryption and get DEK
      const { dek, expiresAt } = await initializeEncryption(
        password,
        stayLoggedIn
      );

      // Migrate data from localStorage to IndexedDB
      await migrateDataToEncrypted(dek);

      // Clear localStorage
      localStorage.removeItem('reduxState');

      // Update encryption status
      dispatch(setEncryptionStatus(EncryptionStatusEnum.ENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.AUTHENTICATED));
      if (expiresAt) {
        dispatch(setSessionExpiresAt(expiresAt));
      }

      setMigrating(false);
    } catch (error) {
      console.error('Encryption setup failed:', error);
      dispatch(setError('Failed to set up encryption: ' + error.message));
      setMigrating(false);

      // Rollback
      await clearAllData();
      clearActiveDEK();
      dispatch(setEncryptionStatus(EncryptionStatusEnum.UNENCRYPTED));
      dispatch(setAuthStatus(AuthStatus.UNAUTHENTICATED));
    }
  };

  const handlePasswordSetupCancel = () => {
    setShowPasswordSetup(false);
  };

  const migrateDataToEncrypted = async (dek) => {
    // Prepare accounts and transactions for batch encryption
    const accountRecords = accounts.map((account) => ({
      id: account.id,
      data: account,
    }));

    const transactionRecords = transactions.map((transaction) => ({
      id: transaction.id,
      data: transaction,
    }));

    // Batch encrypt and store
    await batchStoreEncryptedRecords('accounts', accountRecords, dek);
    await batchStoreEncryptedRecords('transactions', transactionRecords, dek);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography
        variant='h4'
        sx={{ mb: 4 }}
      >
        Settings
      </Typography>

      {/* Encryption Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant='h5'
            sx={{ mb: 3 }}
          >
            Encryption
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='subtitle2'
              sx={{ mb: 1, color: 'text.secondary' }}
            >
              Current Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={encryptionConfig.icon}
                label={encryptionConfig.label}
                color={encryptionConfig.color}
                size='medium'
              />
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary' }}
              >
                {encryptionConfig.description}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {status === EncryptionStatusEnum.UNENCRYPTED ? (
              <Button
                variant='contained'
                color='warning'
                startIcon={<LockIcon />}
                onClick={handleEncryptClick}
                disabled={migrating}
                aria-label='Encrypt your data'
              >
                {migrating ? 'Encrypting...' : 'Encrypt Data'}
              </Button>
            ) : (
              <Tooltip title='This feature is not yet implemented'>
                <span>
                  <Button
                    variant='outlined'
                    disabled
                    aria-label='Change encryption password (not yet implemented)'
                  >
                    Change Encryption Password
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Version Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant='h5'
            sx={{ mb: 3 }}
          >
            About
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography
                variant='subtitle2'
                sx={{ color: 'text.secondary' }}
              >
                Application Version
              </Typography>
              <Typography variant='body1'>v{version}</Typography>
            </Box>

            <Box>
              <Typography
                variant='subtitle2'
                sx={{ color: 'text.secondary' }}
              >
                Data Schema Version
              </Typography>
              <Typography variant='body1'>{CURRENT_SCHEMA_VERSION}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Recommended Settings (Coming Soon) */}
      <Card>
        <CardContent>
          <Typography
            variant='h5'
            sx={{ mb: 1 }}
          >
            Recommended Settings
          </Typography>
          <Typography
            variant='body2'
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Coming Soon
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Placeholder 1: Auto-backup */}
            <Tooltip title='This feature is not yet available'>
              <FormControlLabel
                control={
                  <Switch
                    disabled
                    aria-label='Enable automatic backups (coming soon)'
                  />
                }
                label='Enable Automatic Backups'
              />
            </Tooltip>

            {/* Placeholder 2: Dark mode */}
            <Tooltip title='This feature is not yet available'>
              <FormControlLabel
                control={
                  <Switch
                    disabled
                    aria-label='Enable dark mode (coming soon)'
                  />
                }
                label='Enable Dark Mode'
              />
            </Tooltip>

            {/* Placeholder 3: Currency format */}
            <Tooltip title='This feature is not yet available'>
              <FormControlLabel
                control={
                  <Switch
                    disabled
                    aria-label='Use international currency format (coming soon)'
                  />
                }
                label='Use International Currency Format'
              />
            </Tooltip>

            {/* Placeholder 4: Notifications */}
            <Tooltip title='This feature is not yet available'>
              <FormControlLabel
                control={
                  <Switch
                    disabled
                    aria-label='Enable transaction reminders (coming soon)'
                  />
                }
                label='Enable Transaction Reminders'
              />
            </Tooltip>

            {/* Placeholder 5: Export data */}
            <Tooltip title='This feature is not yet available'>
              <span>
                <Button
                  variant='outlined'
                  disabled
                  sx={{ mt: 1 }}
                  aria-label='Export data to CSV (coming soon)'
                >
                  Export Data to CSV
                </Button>
              </span>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <PasswordSetupDialog
        open={showPasswordSetup}
        onComplete={handlePasswordSetupComplete}
        onCancel={handlePasswordSetupCancel}
      />
    </Box>
  );
}
