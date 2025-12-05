import LedgerTable from '@/components/LedgerTable';
import RepeatedTransactionsModal from '@/components/RepeatedTransactionsModal';
import BulkEditModal from '@/components/BulkEditModal';
import SettingsPanel from '@/components/SettingsPanel';
import LedgerSettingsMenu from '@/components/LedgerSettingsMenu';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import StatementsPanel from '@/components/StatementsPanel';
import { selectors as accountSelectors } from '@/store/accounts';
import {
  actions as transactionActions,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { actions as statementActions } from '@/store/statements';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
} from '@mui/material';
import { Clear, MoreVert, Edit, Menu, Receipt } from '@mui/icons-material';
import { format, parseISO, addMonths } from 'date-fns';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AccountName from './AccountName';
import NewTransactionButton from './NewTransactionButton';

export default function Ledger() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterValue, setFilterValue] = useState('');
  const [showUncategorizedOnly, setShowUncategorizedOnly] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [accountSettingsModalOpen, setAccountSettingsModalOpen] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [repeatedTransactionsModalOpen, setRepeatedTransactionsModalOpen] =
    useState(false);
  const [statementsDrawerOpen, setStatementsDrawerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const account = useSelector(accountSelectors.selectAccountById(accountId));
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(accountId)
  );
  const flatCategories = useSelector(categorySelectors.selectAllCategories);

  // Find transactions with invalid categories
  const invalidCategoryCount = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.categoryId) return false;
      return !flatCategories.some((cat) => cat.id === transaction.categoryId);
    }).length;
  }, [transactions, flatCategories]);

  // Count uncategorized transactions
  const uncategorizedCount = useMemo(() => {
    return transactions.filter((transaction) => !transaction.categoryId).length;
  }, [transactions]);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = [
      ...new Set(
        transactions.map((t) =>
          format(parseISO(t.date.replace(/\//g, '-')), 'yyyy')
        )
      ),
    ];
    return years.sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [transactions]);

  // Filter transactions by selected year
  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return transactions;
    return transactions.filter(
      (t) =>
        format(parseISO(t.date.replace(/\//g, '-')), 'yyyy') === selectedYear
    );
  }, [transactions, selectedYear]);

  // Calculate filtered transactions for "Select All (Filtered)" button
  // Only include transactions that match the filter (not already-selected ones)
  const filteredTransactions = useMemo(() => {
    let filtered = yearFilteredTransactions;

    // Apply uncategorized filter
    if (showUncategorizedOnly) {
      filtered = filtered.filter((transaction) => !transaction.categoryId);
    }

    // Apply text filter
    if (filterValue) {
      const lowerFilter = filterValue.toLowerCase();
      filtered = filtered.filter((transaction) => {
        // Check description
        const matchesDescription = transaction.description
          .toLowerCase()
          .includes(lowerFilter);

        // Check category name
        const category = flatCategories.find(
          (cat) => cat.id === transaction.categoryId
        );
        const matchesCategory = category?.name
          .toLowerCase()
          .includes(lowerFilter);

        // Check parent category name if this is a subcategory
        const parentCategory = category?.parentId
          ? flatCategories.find((cat) => cat.id === category.parentId)
          : null;
        const matchesParentCategory = parentCategory?.name
          .toLowerCase()
          .includes(lowerFilter);

        return matchesDescription || matchesCategory || matchesParentCategory;
      });
    }

    return filterValue || showUncategorizedOnly ? filtered : [];
  }, [
    filterValue,
    showUncategorizedOnly,
    yearFilteredTransactions,
    flatCategories,
  ]);

  const allMonths = transactions?.length
    ? [
        ...new Set(
          transactions.map((t) => {
            const date = parseISO(t.date.replace(/\//g, '-'));
            return `${format(date, 'yyyy')}-${format(date, 'MMMM')}`;
          })
        ),
      ].sort((a, b) => {
        const [aYear, aMonth] = a.split('-');
        const [bYear, bMonth] = b.split('-');
        const aDate = new Date(`${aMonth} 1, ${aYear}`);
        const bDate = new Date(`${bMonth} 1, ${bYear}`);
        return bDate.getTime() - aDate.getTime();
      })
    : [];

  const getDefaultCollapsedGroups = () => {
    const current = new Date();
    const next = addMonths(current, 1);
    const currentMonthStr = `${format(current, 'yyyy')}-${format(
      current,
      'MMMM'
    )}`;
    const nextMonthStr = `${format(next, 'yyyy')}-${format(next, 'MMMM')}`;
    const currentYear = format(current, 'yyyy');

    // Return both year identifiers and month identifiers for collapsing
    return [
      ...allMonths.filter((month) => {
        const [year] = month.split('-');
        return (
          year !== currentYear ||
          (month !== currentMonthStr && month !== nextMonthStr)
        );
      }),
      ...allMonths
        .map((month) => month.split('-')[0])
        .filter((year) => year !== currentYear),
    ];
  };

  const [collapsedGroups, setCollapsedGroups] = useState(() =>
    getDefaultCollapsedGroups()
  );
  const hasGeneratedStatements = useRef(new Set());

  useEffect(() => {
    if (!account) {
      navigate('/accounts');
    } else if (account.type === 'Credit Card' && account.statementDay) {
      // Check if we've already generated for this account
      if (hasGeneratedStatements.current.has(accountId)) {
        return;
      }

      // Mark as generated BEFORE dispatching to prevent race conditions
      hasGeneratedStatements.current.add(accountId);
      dispatch(statementActions.autoGenerateStatements(accountId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]); // Only re-run if accountId changes (navigating to different account)

  if (!account) {
    return null;
  }

  const handleCollapseAll = () => {
    // Include both month identifiers and year identifiers
    setCollapsedGroups([
      ...allMonths,
      ...new Set(allMonths.map((month) => month.split('-')[0])),
    ]);
  };

  const handleExpandAll = () => {
    setCollapsedGroups([]);
  };

  const handleReset = () => {
    setCollapsedGroups(getDefaultCollapsedGroups());
  };

  const handleSelectionChange = (transactionId, isSelected) => {
    setSelectedTransactions((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(transactionId);
      } else {
        newSet.delete(transactionId);
      }
      return newSet;
    });
  };

  const handleBulkEditClick = () => {
    setBulkEditModalOpen(true);
  };

  const handleBulkEditClose = () => {
    setBulkEditModalOpen(false);
  };

  const handleBulkEditApply = (updates) => {
    dispatch(
      transactionActions.updateMultipleTransactionsFields(
        Array.from(selectedTransactions),
        updates
      )
    );
    setSelectedTransactions(new Set());
    setBulkEditModalOpen(false);
  };

  const handleDeleteTransactions = () => {
    // Delete all selected transactions
    const transactionIds = Array.from(selectedTransactions);
    transactionIds.forEach((transactionId) => {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (transaction) {
        dispatch(
          transactionActions.removeTransactionById(
            transaction.accountId,
            transaction
          )
        );
      }
    });
    setSelectedTransactions(new Set());
    setBulkEditModalOpen(false);
  };

  const handleSelectAllFiltered = () => {
    // Select all transactions that match the current filter
    const filteredIds = new Set(filteredTransactions.map((t) => t.id));
    setSelectedTransactions(filteredIds);
  };

  const handleSettingsMenuOpen = (event) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };

  const handleAccountSettingsOpen = () => {
    setAccountSettingsModalOpen(true);
  };

  const handleAccountSettingsClose = () => {
    setAccountSettingsModalOpen(false);
  };

  const handleRepeatedTransactionsOpen = () => {
    setRepeatedTransactionsModalOpen(true);
  };

  const handleRepeatedTransactionsClose = () => {
    setRepeatedTransactionsModalOpen(false);
  };

  const handleClearInvalidCategories = () => {
    // Find all transactions with invalid categories and clear them
    const transactionsToUpdate = transactions
      .filter((transaction) => {
        if (!transaction.categoryId) return false;
        return !flatCategories.some((cat) => cat.id === transaction.categoryId);
      })
      .map((t) => t.id);

    if (transactionsToUpdate.length > 0) {
      dispatch(
        transactionActions.updateMultipleTransactionsFields(
          transactionsToUpdate,
          { categoryId: null }
        )
      );
    }
  };

  const handleClearSelected = () => {
    setSelectedTransactions(new Set());
  };

  const handleToggleUncategorized = () => {
    setShowUncategorizedOnly(!showUncategorizedOnly);
  };

  const hasActiveFilters = filterValue || showUncategorizedOnly;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      {/* Collapsible Left Sidebar */}
      <Box
        sx={{
          width: sidebarOpen ? '240px' : '0px',
          minWidth: sidebarOpen ? '240px' : '0px',
          borderRight: sidebarOpen ? '1px solid' : 'none',
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {sidebarOpen && (
          <SettingsPanel
            account={account}
            selectedYear={selectedYear}
          />
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Unified Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid',
            borderColor: 'divider',
            gap: 2,
          }}
        >
          {/* Left Section: Menu + Account Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}>
              <IconButton
                onClick={toggleSidebar}
                size='medium'
                aria-label='toggle sidebar'
              >
                <Menu />
              </IconButton>
            </Tooltip>
            <AccountName account={account} />
          </Box>

          {/* Center Section: Year Filter + Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <FormControl
              size='small'
              sx={{ minWidth: 120 }}
            >
              <InputLabel id='year-filter-label'>Year</InputLabel>
              <Select
                labelId='year-filter-label'
                id='year-filter'
                value={selectedYear}
                label='Year'
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value='all'>All Years</MenuItem>
                {availableYears.map((year) => (
                  <MenuItem
                    key={year}
                    value={year}
                  >
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              id='filter'
              placeholder='Search categories and descriptions...'
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              variant='outlined'
              size='small'
              sx={{ width: '425px' }}
              InputProps={{
                endAdornment: filterValue && (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='clear filter'
                      onClick={() => setFilterValue('')}
                      edge='end'
                      size='small'
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Active Filter Chips */}
            {showUncategorizedOnly && (
              <Chip
                label='Uncategorized Only'
                size='small'
                onDelete={handleToggleUncategorized}
                color='primary'
                variant='outlined'
              />
            )}

            {/* Select All / Deselect All Button */}
            {selectedTransactions.size > 0 ? (
              <Button
                variant='outlined'
                onClick={handleClearSelected}
                aria-label='Deselect all transactions'
                size='small'
              >
                Deselect All ({selectedTransactions.size})
              </Button>
            ) : (
              (filterValue || showUncategorizedOnly) &&
              filteredTransactions.length > 0 && (
                <Button
                  variant='outlined'
                  onClick={handleSelectAllFiltered}
                  aria-label='Select all filtered transactions'
                  size='small'
                >
                  Select All ({filteredTransactions.length})
                </Button>
              )
            )}
          </Box>

          {/* Right Section: Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Statements Button - Only for credit cards */}
            {account.type === 'Credit Card' && account.statementDay && (
              <Tooltip title='View Statements'>
                <IconButton
                  onClick={() => setStatementsDrawerOpen(true)}
                  size='medium'
                  aria-label='view statements'
                  color='primary'
                >
                  <Receipt />
                </IconButton>
              </Tooltip>
            )}

            <NewTransactionButton compact />

            {/* Bulk Edit Button - More prominent when items selected */}
            {selectedTransactions.size > 0 ? (
              <Button
                variant='contained'
                color='primary'
                onClick={handleBulkEditClick}
                aria-label='edit selected transactions'
                size='small'
                startIcon={<Edit />}
              >
                Edit ({selectedTransactions.size})
              </Button>
            ) : (
              <Tooltip title='Select transactions to edit'>
                <span>
                  <IconButton
                    onClick={handleBulkEditClick}
                    size='medium'
                    aria-label='edit selected transactions'
                    disabled
                  >
                    <Edit />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title='Ledger Settings'>
              <IconButton
                onClick={handleSettingsMenuOpen}
                size='medium'
                aria-label='open ledger settings menu'
              >
                <MoreVert />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filter Results Summary */}
        {hasActiveFilters && (
          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: 'info.light',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ fontSize: '0.875rem', color: 'info.dark' }}>
              Showing {filteredTransactions.length} of {transactions.length}{' '}
              transactions
            </Box>
          </Box>
        )}

        {/* Table Container */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <LedgerTable
            filterValue={filterValue}
            showUncategorizedOnly={showUncategorizedOnly}
            collapsedGroups={collapsedGroups}
            setCollapsedGroups={setCollapsedGroups}
            selectedTransactions={selectedTransactions}
            onSelectionChange={handleSelectionChange}
            selectedYear={selectedYear}
          />
        </Box>
        <RepeatedTransactionsModal
          open={repeatedTransactionsModalOpen}
          onClose={handleRepeatedTransactionsClose}
        />
        <BulkEditModal
          open={bulkEditModalOpen}
          onClose={handleBulkEditClose}
          selectedCount={selectedTransactions.size}
          onApplyChanges={handleBulkEditApply}
          onDeleteTransactions={handleDeleteTransactions}
        />
        <LedgerSettingsMenu
          anchorEl={settingsMenuAnchor}
          open={Boolean(settingsMenuAnchor)}
          onClose={handleSettingsMenuClose}
          onCollapseAll={handleCollapseAll}
          onExpandAll={handleExpandAll}
          onReset={handleReset}
          onAccountSettings={handleAccountSettingsOpen}
          onClearInvalidCategories={handleClearInvalidCategories}
          invalidCategoryCount={invalidCategoryCount}
          onCreateRepeatedTransactions={handleRepeatedTransactionsOpen}
          showUncategorizedOnly={showUncategorizedOnly}
          onToggleUncategorized={handleToggleUncategorized}
          uncategorizedCount={uncategorizedCount}
        />
        <AccountSettingsModal
          open={accountSettingsModalOpen}
          onClose={handleAccountSettingsClose}
          account={account}
        />
        <Drawer
          anchor='right'
          open={statementsDrawerOpen}
          onClose={() => setStatementsDrawerOpen(false)}
        >
          <Box sx={{ width: 500, p: 3, mt: 8 }}>
            <StatementsPanel accountId={accountId} />
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
}
