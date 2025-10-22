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
import { useSelector } from 'react-redux';
import {
  EncryptionStatus as EncryptionStatusEnum,
  selectors as encryptionSelectors,
} from '@/store/encryption';

export default function Settings() {
  const status = useSelector(encryptionSelectors.selectEncryptionStatus);
  const isAuthenticated = useSelector(
    encryptionSelectors.selectIsAuthenticated
  );

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

          <Box sx={{ mt: 3 }}>
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
    </Box>
  );
}
