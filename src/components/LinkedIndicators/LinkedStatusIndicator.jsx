import { Link as LinkIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

export default function LinkedStatusIndicator({ title = 'Linked' }) {
  return (
    <Tooltip title={title}>
      <LinkIcon
        sx={{
          fontSize: '0.95rem',
          color: 'primary.main',
          verticalAlign: 'middle',
        }}
      />
    </Tooltip>
  );
}
