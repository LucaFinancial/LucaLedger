import { Box, TextField } from '@mui/material';
import { useState } from 'react';

import LedgerTable from './components/LedgerTable';
import NewTransactionButton from './components/NewTransactionButton';

export default function LedgerPage() {
  const [filterValue, setFilterValue] = useState('');

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}
    >
      <Box sx={{ width: '82%', padding: '5px' }}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        ></Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: '50px',
            paddingRight: '50px',
          }}
        ></Box>
        <Box>
          <TextField
            id='filter'
            label='Filter'
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            variant='outlined'
            size='small'
            sx={{ width: '100%' }}
          />
        </Box>
        <LedgerTable filterValue={filterValue} />
        <NewTransactionButton />
      </Box>
    </Box>
  );
}
