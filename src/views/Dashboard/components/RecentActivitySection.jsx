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
import HistoryIcon from '@mui/icons-material/History';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { constants as transactionConstants } from '@/store/transactions';

export default function RecentActivitySection({
  recentTransactions,
  recentTotals,
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
        borderLeft: '4px solid #ff9800',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: '#fff3e0',
          '&:hover': { backgroundColor: '#ffe0b2' },
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
            <HistoryIcon sx={{ color: '#ff9800' }} />
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold' }}
            >
              Recent Activity
            </Typography>
            <Chip
              label={`Last 14 Days`}
              size='small'
              sx={{ backgroundColor: '#ff9800', color: 'white' }}
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
                Completed:
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: '#9e9e9e',
                  fontWeight: 'bold',
                  display: 'inline',
                }}
              >
                {formatCurrency(recentTotals.completed)}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mr: 0.5 }}
              >
                Pending:
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: '#ff9800',
                  fontWeight: 'bold',
                  display: 'inline',
                }}
              >
                {formatCurrency(recentTotals.pending)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table size='small'>
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
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align='center'
                    sx={{ py: 3, color: 'text.secondary' }}
                  >
                    No recent transactions in the last 14 days
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((tx) => (
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
                            transactionConstants.TransactionStatusEnum.COMPLETE
                              ? '#9e9e9e'
                              : '#ff9800',
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

RecentActivitySection.propTypes = {
  recentTransactions: PropTypes.array.isRequired,
  recentTotals: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
  }).isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatTransactionAmount: PropTypes.func.isRequired,
  getTransactionColor: PropTypes.func.isRequired,
  getAccountName: PropTypes.func.isRequired,
};
