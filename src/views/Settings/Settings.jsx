import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  Gavel as GavelIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '@/auth';
import { version } from '../../../package.json';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import TermsOfServiceModal from '@/components/TermsOfServiceModal';
import {
  actions as settingsActions,
  selectors as settingsSelectors,
} from '@/store/settings';

export default function Settings() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const [showTosModal, setShowTosModal] = useState(false);

  const recurringProjection = useSelector(
    settingsSelectors.selectRecurringProjection
  );
  const [projectionError, setProjectionError] = useState('');

  const handleProjectionChange = (field, value) => {
    const newProjection = { ...recurringProjection, [field]: value };

    // Validate max 7 years
    let years = 0;
    const amount =
      field === 'amount' ? parseInt(value, 10) : newProjection.amount;
    const unit = field === 'unit' ? value : newProjection.unit;

    if (isNaN(amount) || amount <= 0) {
      setProjectionError('Amount must be a positive number');
      return;
    }

    switch (unit) {
      case 'years':
        years = amount;
        break;
      case 'months':
        years = amount / 12;
        break;
      case 'weeks':
        years = amount / 52;
        break;
      case 'days':
        years = amount / 365;
        break;
      default:
        years = 0;
    }

    if (years > 7) {
      setProjectionError('Projection cannot exceed 7 years');
      // Still update state but show error? Or block?
      // Let's block the update if it exceeds limit, or just show error and let them fix it?
      // Better to block invalid state or clamp it.
      // Let's show error and not dispatch.
      return;
    }

    setProjectionError('');
    dispatch(
      settingsActions.setRecurringProjection({ ...newProjection, amount })
    );
  };

  const encryptionConfig = {
    label: 'Encrypted',
    icon: <LockIcon />,
    color: 'success',
    description: currentUser
      ? `Your data is encrypted for user: ${currentUser.username}`
      : 'Your data is encrypted',
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
            Encryption & Security
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

          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', mt: 2 }}
          >
            All data is encrypted with AES-256 encryption. Your data is stored
            locally and protected by your password.
          </Typography>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant='h5'
            sx={{ mb: 3 }}
          >
            Preferences
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant='subtitle2'
              sx={{ mb: 2, color: 'text.secondary' }}
            >
              Recurring Transactions Projection
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 2, color: 'text.secondary' }}
            >
              Determine how far into the future recurring transactions should be
              generated.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label='Amount'
                type='number'
                value={recurringProjection.amount}
                onChange={(e) =>
                  handleProjectionChange('amount', e.target.value)
                }
                sx={{ width: 120 }}
                error={!!projectionError}
              />
              <FormControl sx={{ width: 150 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={recurringProjection.unit}
                  label='Unit'
                  onChange={(e) =>
                    handleProjectionChange('unit', e.target.value)
                  }
                >
                  <MenuItem value='years'>Years</MenuItem>
                  <MenuItem value='months'>Months</MenuItem>
                  <MenuItem value='weeks'>Weeks</MenuItem>
                  <MenuItem value='days'>Days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {projectionError && (
              <Alert
                severity='error'
                sx={{ mt: 2, maxWidth: 400 }}
              >
                {projectionError}
              </Alert>
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

            <Box>
              <Button
                startIcon={<GavelIcon />}
                onClick={() => setShowTosModal(true)}
                variant='outlined'
                size='small'
              >
                View Terms of Service
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <TermsOfServiceModal
        open={showTosModal}
        onClose={() => setShowTosModal(false)}
      />
    </Box>
  );
}
