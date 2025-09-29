import LedgerTable from '@/components/LedgerTable';
import RepeatedTransactionsModal from '@/components/RepeatedTransactionsModal';
import SettingsPanel from '@/components/SettingsPanel';
import { selectors } from '@/store/accounts';
import { Box, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AccountName from './AccountName';
import NewTransactionButton from './NewTransactionButton';

export default function Ledger() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState('');
  const account = useSelector(selectors.selectAccountById(accountId));

  const allMonths = account?.transactions?.length
    ? [
        ...new Set(
          account.transactions.map((t) => {
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

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '18%',
          borderRight: '1px solid black',
        }}
      >
        <SettingsPanel account={account} />
      </Box>
      <Box sx={{ width: '82%', overflow: 'hidden' }}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
          }}
        >
          <AccountName account={account} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            padding: '15px',
          }}
        >
          <TextField
            id='filter'
            label='Filter'
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            variant='outlined'
            size='small'
            sx={{ width: '700px' }}
          />
          <Button onClick={handleCollapseAll}>Collapse All</Button>
          <Button onClick={handleExpandAll}>Expand All</Button>
          <Button onClick={handleReset}>Reset</Button>
        </Box>
        <LedgerTable
          filterValue={filterValue}
          collapsedGroups={collapsedGroups}
          setCollapsedGroups={setCollapsedGroups}
        />
        <NewTransactionButton />
        <RepeatedTransactionsModal />
      </Box>
    </Box>
  );
}
