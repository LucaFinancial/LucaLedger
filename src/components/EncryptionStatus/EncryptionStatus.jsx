import { Chip, Tooltip } from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  EncryptionStatus as EncryptionStatusEnum,
  selectors as encryptionSelectors,
} from '@/store/encryption';

export default function EncryptionStatus() {
  const status = useSelector(encryptionSelectors.selectEncryptionStatus);
  const isAuthenticated = useSelector(
    encryptionSelectors.selectIsAuthenticated
  );

  const getStatusConfig = () => {
    switch (status) {
      case EncryptionStatusEnum.ENCRYPTED:
        return {
          label: 'Encrypted',
          icon: <LockIcon />,
          color: 'success',
          tooltip: isAuthenticated
            ? 'Your data is encrypted and you are logged in'
            : 'Your data is encrypted',
        };
      case EncryptionStatusEnum.ENCRYPTING:
        return {
          label: 'Encrypting...',
          icon: <SyncIcon />,
          color: 'warning',
          tooltip: 'Encryption in progress',
        };
      case EncryptionStatusEnum.UNENCRYPTED:
      default:
        return {
          label: 'Unencrypted',
          icon: <LockOpenIcon />,
          color: 'default',
          tooltip: 'Your data is not encrypted',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip title={config.tooltip}>
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size='small'
        sx={{ ml: 1 }}
      />
    </Tooltip>
  );
}
