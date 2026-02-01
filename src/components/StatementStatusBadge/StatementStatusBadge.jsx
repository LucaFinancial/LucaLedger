import { Chip } from '@mui/material';
import { Lock, CheckCircle, Schedule, EditNote } from '@mui/icons-material';
import PropTypes from 'prop-types';

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'default',
    icon: EditNote,
  },
  current: {
    label: 'Current',
    color: 'primary',
    icon: Schedule,
  },
  past: {
    label: 'Past',
    color: 'success',
    icon: CheckCircle,
  },
  locked: {
    label: 'Locked',
    color: 'error',
    icon: Lock,
  },
};

export default function StatementStatusBadge({
  status,
  isLocked = false,
  size = 'small',
}) {
  // If locked, show locked status regardless of computed status
  const displayStatus = isLocked ? 'locked' : status;
  const config = statusConfig[displayStatus] || statusConfig.draft;
  const IconComponent = config.icon;

  return (
    <Chip
      icon={<IconComponent />}
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: status === 'current' ? 'bold' : 'normal',
      }}
    />
  );
}

StatementStatusBadge.propTypes = {
  status: PropTypes.oneOf(['draft', 'current', 'past']), // Computed field from selectors
  isLocked: PropTypes.bool, // Locked state from stored field
  size: PropTypes.oneOf(['small', 'medium']),
};
