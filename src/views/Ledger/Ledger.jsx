import LedgerTable from '@/components/LedgerTable';
import RepeatedTransactionsModal from '@/components/RepeatedTransactionsModal';
import BulkEditModal from '@/components/BulkEditModal';
import SettingsPanel from '@/components/SettingsPanel';
import LedgerSettingsMenu from '@/components/LedgerSettingsMenu';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { selectors as accountSelectors } from '@/store/accounts';
import {
  actions as transactionActions,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Badge,
} from '@mui/material';
import { Clear, MoreVert, Edit, Menu } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useEffect, useState, useMemo } from 'react';
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

  // Calculate filtered transactions for "Select All (Filtered)" button
  // Only include transactions that match the filter (not already-selected ones)
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply uncategorized filter
    if (showUncategorizedOnly) {
      filtered = filtered.filter((transaction) => !transaction.categoryId);
    }

    // Apply text filter
    if (filterValue) {
      filtered = filtered.filter((transaction) =>
        transaction.description
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    return filterValue || showUncategorizedOnly ? filtered : [];
  }, [filterValue, showUncategorizedOnly, transactions]);

  const allMonths = transactions?.length
    ? [
        ...new Set(
          transactions.map((t) => {
            const date = dayjs(t.date);
            return `${date.format('YYYY')}-${date.format('MMMM')}`;
          })
        ),
      ].sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? -1 : 1))
    : [];

  const getDefaultCollapsedGroups = () => {
    const current = dayjs();
    const next = current.add(1, 'month');
    const currentMonthStr = `${current.format('YYYY')}-${current.format(
      'MMMM'
    )}`;
    const nextMonthStr = `${next.format('YYYY')}-${next.format('MMMM')}`;
    const currentYear = current.format('YYYY');

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

  useEffect(() => {
    if (!account) {
      navigate('/accounts');
    }
  }, [account, navigate]);

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
        {sidebarOpen && <SettingsPanel account={account} />}
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

          {/* Center Section: Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <TextField
              id='filter'
              placeholder='Search transactions...'
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              variant='outlined'
              size='small'
              sx={{ width: '300px' }}
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
            {(filterValue || showUncategorizedOnly) &&
              filteredTransactions.length > 0 && (
                <Button
                  variant='outlined'
                  onClick={handleSelectAllFiltered}
                  aria-label='Select all filtered transactions'
                  size='small'
                >
                  Select All ({filteredTransactions.length})
                </Button>
              )}
          </Box>

          {/* Right Section: Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NewTransactionButton compact />
            <Tooltip title='Edit Transactions'>
              <span>
                <IconButton
                  onClick={handleBulkEditClick}
                  size='medium'
                  aria-label='edit selected transactions'
                  disabled={selectedTransactions.size === 0}
                >
                  <Badge
                    badgeContent={selectedTransactions.size}
                    color='primary'
                    max={999}
                  >
                    <Edit />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
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

        {/* Table Container */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <LedgerTable
            filterValue={filterValue}
            showUncategorizedOnly={showUncategorizedOnly}
            collapsedGroups={collapsedGroups}
            setCollapsedGroups={setCollapsedGroups}
            selectedTransactions={selectedTransactions}
            onSelectionChange={handleSelectionChange}
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
          onClearSelected={handleClearSelected}
          selectedCount={selectedTransactions.size}
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
      </Box>
    </Box>
  );
}
