import { AccordionSummary, Box, Chip, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';

export default function MonthOverviewHeader({ dateRanges }) {
  return (
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      sx={{
        backgroundColor: '#e3f2fd',
        '&:hover': { backgroundColor: '#bbdefb' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          pr: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            Current Month Overview
          </Typography>
          <Chip
            label={format(dateRanges.today, 'MMMM yyyy')}
            size='small'
            sx={{ backgroundColor: '#2196f3', color: 'white' }}
          />
        </Box>
      </Box>
    </AccordionSummary>
  );
}
