import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TooltipValue from './TooltipValue';
import {
  getBalanceColor,
  getExpenseColor,
} from './monthOverviewSummaryUtils';

function getComparisonValueColor(rowType, amount) {
  if (rowType === 'cardPayments') {
    return '#4caf50';
  }

  if (
    rowType === 'outflow' ||
    rowType === 'cardCharges' ||
    rowType === 'cardBalance'
  ) {
    return getExpenseColor(amount);
  }

  return getBalanceColor(amount);
}

function getRemainingTotalCellConfig(row, sectionTitle) {
  const remainingValue = row.remaining ?? 0;
  const positiveIsGood = row.type === 'inflow' || row.type === 'balance';
  const upIcon = <ArrowDropUpIcon sx={{ fontSize: '1.9rem', mr: 0.25 }} />;
  const downIcon = (
    <ArrowDropDownIcon sx={{ fontSize: '1.9rem', mr: 0.25 }} />
  );

  if (sectionTitle === 'Income') {
    return {
      value: Math.abs(remainingValue),
      type: remainingValue >= 0 ? 'balance' : 'outflow',
      icon: null,
    };
  }

  if (sectionTitle === 'Expenses') {
    return {
      value: Math.abs(remainingValue),
      type: remainingValue >= 0 ? 'outflow' : 'balance',
      icon: null,
    };
  }

  if (remainingValue > 0) {
    return {
      value: Math.abs(remainingValue),
      type: positiveIsGood ? 'balance' : 'outflow',
      icon: upIcon,
    };
  }

  if (remainingValue < 0) {
    return {
      value: Math.abs(remainingValue),
      type: positiveIsGood ? 'outflow' : 'balance',
      icon: downIcon,
    };
  }

  return {
    value: remainingValue,
    type: row.type,
    icon: null,
  };
}

function getSectionHeaderStyles(sectionTitle) {
  switch (sectionTitle) {
    case 'Income':
      return {
        backgroundColor: '#e8f5e9',
        borderColor: '#a5d6a7',
        color: '#2e7d32',
      };
    case 'Expenses':
      return {
        backgroundColor: '#ffebee',
        borderColor: '#ef9a9a',
        color: '#c62828',
      };
    case 'Credit Cards':
      return {
        backgroundColor: '#e3f2fd',
        borderColor: '#90caf9',
        color: '#1565c0',
      };
    case 'Income vs Expenses':
      return {
        backgroundColor: '#f3e5f5',
        borderColor: '#ce93d8',
        color: '#7b1fa2',
      };
    default:
      return {
        backgroundColor: '#f8fafc',
        borderColor: '#e0e0e0',
        color: 'text.primary',
      };
  }
}

export default function DetailedComparisonTable({
  sections,
  formatCurrency,
}) {
  return (
    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
      {sections.map((section) => {
        const headerStyles = getSectionHeaderStyles(section.title);

        return (
          <Grid
            key={section.title}
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex' }}
          >
            <Paper
              sx={{
                width: '100%',
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  backgroundColor: headerStyles.backgroundColor,
                  borderBottom: `1px solid ${headerStyles.borderColor}`,
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 700, color: headerStyles.color }}
                >
                  {section.title}
                </Typography>
              </Box>

              <TableContainer sx={{ flex: 1 }}>
                <Table size='small' sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '34%' }} />
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 700, color: '#2196f3' }}
                      >
                        Current
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 700, color: '#9c27b0' }}
                      >
                        Remaining
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 700, color: '#2e7d32' }}
                      >
                        Month End Totals
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.rows.map((row) => {
                      const remainingDisplay =
                        row.emphasis === 'total'
                          ? getRemainingTotalCellConfig(row, section.title)
                          : {
                              value: row.remaining,
                              type: row.type,
                              icon: null,
                            };

                      return (
                        <TableRow
                          key={`${section.title}-${row.label}`}
                          sx={
                            row.emphasis
                              ? {
                                  backgroundColor:
                                    row.emphasis === 'total'
                                      ? '#fafafa'
                                      : 'rgba(33, 150, 243, 0.04)',
                                }
                              : undefined
                          }
                        >
                          <TableCell
                            component='th'
                            scope='row'
                            sx={{
                              pl: row.emphasis ? 2 : 3,
                              height:
                                row.emphasis === 'total' ? '3.25rem' : undefined,
                              boxSizing:
                                row.emphasis === 'total'
                                  ? 'border-box'
                                  : undefined,
                            }}
                          >
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: row.emphasis ? 700 : 600 }}
                            >
                              {row.label}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              height:
                                row.emphasis === 'total' ? '3.25rem' : undefined,
                              boxSizing:
                                row.emphasis === 'total'
                                  ? 'border-box'
                                  : undefined,
                            }}
                          >
                            <TooltipValue tooltip={row.tooltip}>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: getComparisonValueColor(
                                    row.type,
                                    row.current,
                                  ),
                                  fontWeight: row.emphasis ? 700 : 600,
                                  fontSize:
                                    row.emphasis === 'total'
                                      ? '1rem'
                                      : undefined,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatCurrency(row.current)}
                              </Typography>
                            </TooltipValue>
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              height:
                                row.emphasis === 'total' ? '3.25rem' : undefined,
                              boxSizing:
                                row.emphasis === 'total'
                                  ? 'border-box'
                                  : undefined,
                            }}
                          >
                            <TooltipValue tooltip={row.tooltip}>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: getComparisonValueColor(
                                    remainingDisplay.type,
                                    remainingDisplay.value,
                                  ),
                                  fontWeight: row.emphasis ? 700 : 600,
                                  fontSize:
                                    row.emphasis === 'total'
                                      ? '1rem'
                                      : undefined,
                                  whiteSpace: 'nowrap',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                }}
                              >
                                {remainingDisplay.icon}
                                {formatCurrency(remainingDisplay.value)}
                              </Typography>
                            </TooltipValue>
                          </TableCell>
                          <TableCell
                            align='right'
                            sx={{
                              height:
                                row.emphasis === 'total' ? '3.25rem' : undefined,
                              boxSizing:
                                row.emphasis === 'total'
                                  ? 'border-box'
                                  : undefined,
                            }}
                          >
                            <TooltipValue tooltip={row.tooltip}>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: getComparisonValueColor(
                                    row.type,
                                    row.projected,
                                  ),
                                  fontWeight: row.emphasis ? 700 : 600,
                                  fontSize:
                                    row.emphasis === 'total'
                                      ? '1rem'
                                      : undefined,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatCurrency(row.projected)}
                              </Typography>
                            </TooltipValue>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
