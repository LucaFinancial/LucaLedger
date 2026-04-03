import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';

export default function YearControls({ yearId, onExpandYear, onCollapseYear }) {
  return (
    <Stack direction='row' spacing={1}>
      <IconButton size='small' onClick={() => onExpandYear(yearId)}>
        <ExpandMore fontSize='small' />
        <Typography variant='srOnly'>Expand</Typography>
      </IconButton>
      <IconButton size='small' onClick={() => onCollapseYear(yearId)}>
        <ExpandLess fontSize='small' />
        <Typography variant='srOnly'>Collapse</Typography>
      </IconButton>
    </Stack>
  );
}

