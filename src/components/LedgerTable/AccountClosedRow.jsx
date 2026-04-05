import { TableCell, TableRow, Typography } from '@mui/material';

import { LEDGER_COLUMN_COUNT } from './ledgerColumnConfig';
import { getAccountClosedRowContent } from './utils';

export default function AccountClosedRow({ closedAt }) {
  const { label, detail } = getAccountClosedRowContent(closedAt);

  return (
    <TableRow
      sx={{
        '& td': {
          borderTop: '2px solid',
          borderBottom: '2px solid',
          borderColor: 'error.main',
          backgroundColor: 'rgba(211, 47, 47, 0.08)',
          color: 'error.main',
          px: 2,
          py: 1.5,
        },
      }}
    >
      <TableCell colSpan={LEDGER_COLUMN_COUNT}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Typography component='span' sx={{ fontWeight: 800, letterSpacing: '0.08em' }}>
            {label}
          </Typography>
          {detail && (
            <Typography component='span' sx={{ fontWeight: 600 }}>
              Closed on {detail}
            </Typography>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
