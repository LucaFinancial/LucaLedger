import { AccordionSummary, Box, Chip, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

export default function MonthOverviewHeader({
  dateRanges,
  totals,
  creditCardTotals,
  currentMonthTotals,
  monthEndProjections,
  formatCurrency,
}) {
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
          <TrendingUpIcon sx={{ color: '#2196f3' }} />
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            Current Month Overview
          </Typography>
          <Chip
            label={format(dateRanges.today, 'MMMM yyyy')}
            size='small'
            sx={{ backgroundColor: '#2196f3', color: 'white' }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            ml: 'auto',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mr: 0.5 }}
            >
              Starting:
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#ba68c8',
                fontWeight: 'bold',
                display: 'inline',
              }}
            >
              {formatCurrency(totals.current - currentMonthTotals.netFlow)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mr: 0.5 }}
            >
              Current:
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#9c27b0',
                fontWeight: 'bold',
                display: 'inline',
              }}
            >
              {formatCurrency(totals.current)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mr: 0.5 }}
            >
              Projected End:
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#7b1fa2',
                fontWeight: 'bold',
                display: 'inline',
              }}
            >
              {formatCurrency(
                totals.current -
                  currentMonthTotals.netFlow +
                  monthEndProjections.projectedNetFlow,
              )}
            </Typography>
          </Box>
          <Box
            sx={{
              borderLeft: '2px solid rgba(0,0,0,0.12)',
              paddingLeft: 2,
            }}
          >
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mr: 0.5 }}
            >
              Credit Card Balance:
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#d32f2f',
                fontWeight: 'bold',
                display: 'inline',
              }}
            >
              {formatCurrency(creditCardTotals.current)}
              {creditCardTotals.pending !== creditCardTotals.current && (
                <span>
                  {' '}
                  (+
                  {formatCurrency(
                    creditCardTotals.pending - creditCardTotals.current,
                  )}{' '}
                  pending)
                </span>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </AccordionSummary>
  );
}

MonthOverviewHeader.propTypes = {
  dateRanges: PropTypes.object.isRequired,
  totals: PropTypes.shape({
    current: PropTypes.number.isRequired,
  }).isRequired,
  creditCardTotals: PropTypes.shape({
    current: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
  }).isRequired,
  currentMonthTotals: PropTypes.shape({
    netFlow: PropTypes.number.isRequired,
  }).isRequired,
  monthEndProjections: PropTypes.shape({
    projectedNetFlow: PropTypes.number.isRequired,
  }).isRequired,
  formatCurrency: PropTypes.func.isRequired,
};
