import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { constants as transactionConstants } from '@/store/transactions';

export default function UpcomingActivitySection({
  futureTransactions,
  futureTotals,
  formatCurrency,
  formatTransactionAmount,
  getTransactionColor,
  getAccountName,
}) {
  return (
    <Accordion
      defaultExpanded
      sx={{
        mb: 3,
        borderLeft: '4px solid #4caf50',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: '#e8f5e9',
          '&:hover': { backgroundColor: '#c8e6c9' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ color: '#4caf50' }} />
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold' }}
            >
              Upcoming Activity
            </Typography>
            <Chip
              label={`Next 30 Days`}
              size='small'
              sx={{ backgroundColor: '#4caf50', color: 'white' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              ml: 'auto',
              mr: 2,
            }}
          >
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mr: 0.5 }}
              >
                Scheduled:
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: '#2196f3',
                  fontWeight: 'bold',
                  display: 'inline',
                }}
              >
                {formatCurrency(futureTotals.scheduled)}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mr: 0.5 }}
              >
                Planned:
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: '#4caf50',
                  fontWeight: 'bold',
                  display: 'inline',
                }}
              >
                {formatCurrency(futureTotals.planned)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer sx={{ maxHeight: 260, overflow: 'auto' }}>
          <Table
            size='small'
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Account</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align='right'>
                  <strong>Amount</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {futureTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align='center'
                    sx={{ py: 3, color: 'text.secondary' }}
                  >
                    No upcoming scheduled or planned transactions
                  </TableCell>
                </TableRow>
              ) : (
                futureTransactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    <TableCell>
                      {dayjs(tx.date, 'YYYY/MM/DD').format('MMM D, YYYY')}
                    </TableCell>
                    <TableCell>{getAccountName(tx.accountId)}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={tx.status}
                        size='small'
                        sx={{
                          backgroundColor:
                            tx.status ===
                            transactionConstants.TransactionStatusEnum.SCHEDULED
                              ? '#2196f3'
                              : '#4caf50',
                          color: 'white',
                          textTransform: 'capitalize',
                          minWidth: '90px',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        color: getTransactionColor(tx),
                        fontWeight: 'bold',
                      }}
                    >
                      {formatTransactionAmount(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

UpcomingActivitySection.propTypes = {
  futureTransactions: PropTypes.array.isRequired,
  futureTotals: PropTypes.shape({
    scheduled: PropTypes.number.isRequired,
    planned: PropTypes.number.isRequired,
  }).isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatTransactionAmount: PropTypes.func.isRequired,
  getTransactionColor: PropTypes.func.isRequired,
  getAccountName: PropTypes.func.isRequired,
};
