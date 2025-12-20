import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { Lock as LockIcon, Gavel as GavelIcon } from '@mui/icons-material';
import { useAuth } from '@/auth';
import { version } from '../../../package.json';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import TermsOfServiceModal from '@/components/TermsOfServiceModal';

export default function Settings() {
  const { currentUser } = useAuth();
  const [showTosModal, setShowTosModal] = useState(false);

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
