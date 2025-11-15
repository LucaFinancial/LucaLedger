import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PropTypes from 'prop-types';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import MonthOverviewSummary from './MonthOverviewSummary';
import PlaceholderCard from '../PlaceholderCard';

export default function CurrentMonthOverviewSection({
  dateRanges,
  totals,
  creditCardTotals,
  currentMonthTotals,
  monthEndProjections,
  remainingMonthTotals,
  formatCurrency,
}) {
  return (
    <Accordion
      defaultExpanded
      sx={{
        mb: 3,
        borderLeft: '4px solid #2196f3',
        '&:before': { display: 'none' },
      }}
    >
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
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold' }}
            >
              Current Month Overview
            </Typography>
            <Chip
              label={dateRanges.today.format('MMMM YYYY')}
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
                    monthEndProjections.projectedNetFlow
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
                      creditCardTotals.pending - creditCardTotals.current
                    )}{' '}
                    pending)
                  </span>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid
          container
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
          >
            <Card
              sx={{
                borderTop: '3px solid #4caf50',
                backgroundColor: '#f1f8f4',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Income
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Current
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{ color: '#4caf50', fontWeight: 'bold' }}
                    >
                      {formatCurrency(currentMonthTotals.income)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Projected
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    >
                      {formatCurrency(monthEndProjections.projectedIncome)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
          >
            <Card
              sx={{
                borderTop: '3px solid #f44336',
                backgroundColor: '#fef1f0',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Expenses
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Current
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{ color: '#f44336', fontWeight: 'bold' }}
                    >
                      {formatCurrency(currentMonthTotals.expenses)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Projected
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{ color: '#d32f2f', fontWeight: 'bold' }}
                    >
                      {formatCurrency(monthEndProjections.projectedExpenses)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
          >
            <Card
              sx={{
                borderTop: '3px solid #2196f3',
                backgroundColor: '#e3f2fd',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Net Flow
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Current
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{
                        color:
                          currentMonthTotals.netFlow >= 0
                            ? '#4caf50'
                            : '#f44336',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(currentMonthTotals.netFlow)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Projected
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{
                        color:
                          monthEndProjections.projectedNetFlow >= 0
                            ? '#4caf50'
                            : '#f44336',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(monthEndProjections.projectedNetFlow)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transaction Status Charges */}
        <Grid
          container
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                borderTop: '3px solid #2196f3',
                backgroundColor: '#e3f2fd',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Completed
                </Typography>
                <Typography
                  variant='h4'
                  sx={{ color: '#2196f3', fontWeight: 'bold' }}
                >
                  {formatCurrency(currentMonthTotals.netFlow)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                borderTop: '3px solid #ff9800',
                backgroundColor: '#fff3e0',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Pending
                </Typography>
                <Typography
                  variant='h4'
                  sx={{ color: '#ff9800', fontWeight: 'bold' }}
                >
                  {formatCurrency(totals.pending - totals.current)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                borderTop: '3px solid #4caf50',
                backgroundColor: '#e8f5e9',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Scheduled
                </Typography>
                <Typography
                  variant='h4'
                  sx={{ color: '#4caf50', fontWeight: 'bold' }}
                >
                  {formatCurrency(totals.scheduled - totals.pending)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                borderTop: '3px solid #673ab7',
                backgroundColor: '#ede7f6',
              }}
            >
              <CardContent>
                <Typography
                  color='textSecondary'
                  gutterBottom
                >
                  Planned
                </Typography>
                <Typography
                  variant='h4'
                  sx={{ color: '#673ab7', fontWeight: 'bold' }}
                >
                  {formatCurrency(totals.future - totals.scheduled)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Month Overview Summary */}
        <MonthOverviewSummary
          monthEndProjections={monthEndProjections}
          currentMonthTotals={currentMonthTotals}
          remainingMonthTotals={remainingMonthTotals}
          totals={totals}
          formatCurrency={formatCurrency}
        />

        {/* Category Breakdown */}
        <CategoryBreakdown />

        {/* Placeholder for Trend Chart */}
        <PlaceholderCard
          title='Balance Trend Chart — Coming Soon'
          description='Track your balance movement throughout the current month'
          color='#9e9e9e'
          backgroundColor='#f5f5f5'
          borderColor='#bdbdbd'
        />
      </AccordionDetails>
    </Accordion>
  );
}

CurrentMonthOverviewSection.propTypes = {
  dateRanges: PropTypes.object.isRequired,
  totals: PropTypes.object.isRequired,
  creditCardTotals: PropTypes.object.isRequired,
  currentMonthTotals: PropTypes.object.isRequired,
  monthEndProjections: PropTypes.object.isRequired,
  remainingMonthTotals: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
};
