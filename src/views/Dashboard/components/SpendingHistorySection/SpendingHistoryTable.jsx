import { Fragment } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import {
  SPENDING_STATE_META,
  SPENDING_STATE_ORDER,
} from '@/utils/spendingAnalytics';

import { TransactionDetailRow } from './TransactionDetailTable';
import { formatCurrencyFromCents } from './spendingHistoryHelpers';
import {
  COLORS,
  LEDGER_STATE_META,
  MONTHLY_AVG_META,
  TOTAL_META,
} from './spendingHistoryConstants';

function StateBreakdownCells({ item, compact = false }) {
  return (
    <>
      {SPENDING_STATE_ORDER.map((stateKey) => (
        <TableCell
          key={`${item.id}-${stateKey}`}
          align='right'
          sx={{
            color: LEDGER_STATE_META[stateKey].color,
            fontWeight: compact ? undefined : 500,
            fontSize: compact ? '0.875rem' : undefined,
          }}
        >
          {formatCurrencyFromCents(item[stateKey])}
        </TableCell>
      ))}
      <TableCell
        align='right'
        sx={{
          color: TOTAL_META.color,
          fontWeight: compact ? 600 : 600,
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {formatCurrencyFromCents(item.total)}
      </TableCell>
      <TableCell
        align='right'
        sx={{
          color: MONTHLY_AVG_META.color,
          fontWeight: compact ? undefined : 500,
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {formatCurrencyFromCents(item.monthlyAvg)}
      </TableCell>
      <TableCell
        align='right'
        sx={{
          color: 'text.secondary',
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {item.count}
      </TableCell>
    </>
  );
}

function HistoricalCells({ item, compact = false }) {
  return (
    <>
      <TableCell
        align='right'
        sx={{
          color: TOTAL_META.color,
          fontWeight: compact ? undefined : 500,
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {formatCurrencyFromCents(item.total)}
      </TableCell>
      <TableCell
        align='right'
        sx={{
          color: MONTHLY_AVG_META.color,
          fontWeight: compact ? undefined : 500,
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {formatCurrencyFromCents(item.monthlyAvg)}
      </TableCell>
      <TableCell
        align='right'
        sx={{
          color: 'text.secondary',
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {item.percentage.toFixed(1)}%
      </TableCell>
      <TableCell
        align='right'
        sx={{
          color: 'text.secondary',
          fontSize: compact ? '0.875rem' : undefined,
        }}
      >
        {item.count}
      </TableCell>
    </>
  );
}

export default function SpendingHistoryTable({
  accountsById,
  categoryData,
  expandedCategoryId,
  expandedSubcategoryIds,
  hideSubcategories,
  onToggleCategoryExpanded,
  onToggleSubcategoryExpanded,
  showStateBreakdown,
  transactionSortDirection,
  onTransactionSortToggle,
}) {
  const detailColSpan = showStateBreakdown
    ? SPENDING_STATE_ORDER.length + 4
    : 5;

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
            {showStateBreakdown ? (
              <>
                {SPENDING_STATE_ORDER.map((stateKey) => (
                  <TableCell
                    key={stateKey}
                    align='right'
                    sx={{
                      color: LEDGER_STATE_META[stateKey].color,
                      fontWeight: 700,
                    }}
                  >
                    {SPENDING_STATE_META[stateKey].label}
                  </TableCell>
                ))}
                <TableCell
                  align='right'
                  sx={{ color: TOTAL_META.color, fontWeight: 700 }}
                >
                  Total
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    color: MONTHLY_AVG_META.color,
                    fontWeight: 700,
                  }}
                >
                  Monthly Avg
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  Txns
                </TableCell>
              </>
            ) : (
              <>
                <TableCell
                  align='right'
                  sx={{ color: TOTAL_META.color, fontWeight: 700 }}
                >
                  Total
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    color: MONTHLY_AVG_META.color,
                    fontWeight: 700,
                  }}
                >
                  Monthly Avg
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  % of Total
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  Txns
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {categoryData.map((category, index) => {
            const isExpanded = expandedCategoryId === category.id;
            const hasSubcategories = category.subcategories.length > 0;
            const canExpandCategory = hideSubcategories
              ? category.transactions.length > 0
              : hasSubcategories || category.transactions.length > 0;

            return (
              <Fragment key={category.id}>
                <TableRow
                  onClick={() =>
                    canExpandCategory && onToggleCategoryExpanded(category.id)
                  }
                  sx={{
                    cursor: canExpandCategory ? 'pointer' : 'default',
                    '&:hover': canExpandCategory
                      ? { backgroundColor: '#f5f5f5' }
                      : undefined,
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {canExpandCategory ? (
                        <IconButton size='small' sx={{ p: 0 }}>
                          {isExpanded ? (
                            <KeyboardArrowDownIcon fontSize='small' />
                          ) : (
                            <KeyboardArrowRightIcon fontSize='small' />
                          )}
                        </IconButton>
                      ) : null}
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: COLORS[index % COLORS.length],
                          ml: canExpandCategory ? 0 : 3,
                          flexShrink: 0,
                        }}
                      />
                      {category.name}
                    </Box>
                  </TableCell>

                  {showStateBreakdown ? (
                    <StateBreakdownCells item={category} />
                  ) : (
                    <HistoricalCells item={category} />
                  )}
                </TableRow>

                {isExpanded &&
                  (hideSubcategories || !hasSubcategories
                    ? (
                      <TransactionDetailRow
                        transactions={category.transactions}
                        colSpan={detailColSpan}
                        transactionSortDirection={transactionSortDirection}
                        onTransactionSortToggle={onTransactionSortToggle}
                        accountsById={accountsById}
                      />
                      )
                    : category.subcategories.map((subcategory) => {
                        const subcategoryKey = `${category.id}:${subcategory.id}`;
                        const isSubcategoryExpanded =
                          expandedSubcategoryIds.includes(subcategoryKey);
                        const hasTransactions =
                          subcategory.transactions.length > 0;

                        return (
                          <Fragment key={subcategory.id}>
                            <TableRow
                              onClick={() =>
                                hasTransactions &&
                                onToggleSubcategoryExpanded(
                                  category.id,
                                  subcategory.id,
                                )
                              }
                              sx={{
                                backgroundColor: '#fafafa',
                                cursor: hasTransactions ? 'pointer' : 'default',
                                '&:hover': hasTransactions
                                  ? { backgroundColor: '#f3f3f3' }
                                  : undefined,
                              }}
                            >
                              <TableCell sx={{ pl: 8 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  {hasTransactions ? (
                                    <IconButton size='small' sx={{ p: 0 }}>
                                      {isSubcategoryExpanded ? (
                                        <KeyboardArrowDownIcon fontSize='small' />
                                      ) : (
                                        <KeyboardArrowRightIcon fontSize='small' />
                                      )}
                                    </IconButton>
                                  ) : null}
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor:
                                        COLORS[index % COLORS.length],
                                      opacity: 0.6,
                                      flexShrink: 0,
                                      ml: hasTransactions ? 0 : 3,
                                    }}
                                  />
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    {subcategory.name}
                                  </Typography>
                                </Box>
                              </TableCell>

                              {showStateBreakdown ? (
                                <StateBreakdownCells
                                  item={subcategory}
                                  compact
                                />
                              ) : (
                                <HistoricalCells item={subcategory} compact />
                              )}
                            </TableRow>

                            {isSubcategoryExpanded ? (
                              <TransactionDetailRow
                                transactions={subcategory.transactions}
                                colSpan={detailColSpan}
                                transactionSortDirection={transactionSortDirection}
                                onTransactionSortToggle={onTransactionSortToggle}
                                accountsById={accountsById}
                              />
                            ) : null}
                          </Fragment>
                        );
                      }))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
