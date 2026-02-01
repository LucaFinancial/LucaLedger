export const LEDGER_COLUMN_STYLES = {
  selection: {
    padding: '2px 10px',
    textAlign: 'center',
  },
  quickAction: {
    padding: '2px 0px',
    textAlign: 'center',
  },
  status: {
    cursor: 'pointer',
    padding: '0px 0px 0px 10px',
  },
  date: {
    cursor: 'pointer',
    padding: '2px 0px 2px 5px',
    textAlign: 'center',
  },
  category: {
    cursor: 'pointer',
    padding: '2px 0px',
  },
  description: {
    cursor: 'pointer',
    padding: '2px 0px 2px 10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  amount: {
    cursor: 'pointer',
    padding: '2px 10px 2px 0px',
    textAlign: 'right',
  },
  balance: {
    padding: '2px 10px 2px 0px',
    textAlign: 'right',
  },
  actionMenu: {
    textAlign: 'center',
    padding: '2px 5px',
  },
};

export const LEDGER_HEADER_ROW_STYLE = {
  '& .MuiTableCell-root': {
    fontWeight: 600,
    backgroundColor: 'background.paper',
    borderBottom: '2px solid',
    borderColor: 'darkGray',
  },
};

export const LEDGER_ROW_STYLE = {
  '& td': {
    paddingTop: '2px',
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  '&:hover': {
    filter: 'brightness(0.95)',
  },
};

export const LEDGER_STATUS_SELECT_WIDTH = '130px';

export const LEDGER_COLUMN_COUNT = 9;
