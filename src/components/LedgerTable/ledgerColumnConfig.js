export const LEDGER_COLUMN_STYLES = {
  selection: { width: '20px', paddingLeft: '1px' },
  quickAction: {
    width: '20px',
    paddingLeft: '1px',
    paddingRight: '1px',
  },
  status: { width: '135px', paddingLeft: '1px' },
  date: { width: '160px', cursor: 'pointer' },
  category: { width: '130px', minWidth: '130px' },
  description: { width: '500px' },
  amount: { width: '200px', cursor: 'pointer' },
  balance: { width: '100px' },
  actionMenu: { width: '20px', textAlign: 'center' },
};

export const LEDGER_CELL_STYLE = {
  padding: '2px 4px',
  borderBottom: '1px solid',
  borderColor: 'divider',
};

export const LEDGER_HEADER_ROW_STYLE = {
  '& .MuiTableCell-root': {
    fontWeight: 600,
    backgroundColor: 'background.paper',
    borderBottom: '2px solid',
    borderColor: 'divider',
    padding: '12px',
  },
};

export const LEDGER_ROW_STYLE = {
  '&:hover': {
    filter: 'brightness(0.95)',
  },
};

export const LEDGER_STATUS_SELECT_WIDTH = '130px';

export const LEDGER_COLUMN_COUNT = 9;
