import { AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function MonthOverviewHeader() {
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
        </Box>
      </Box>
    </AccordionSummary>
  );
}
