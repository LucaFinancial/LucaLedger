export const LEDGER_COLUMN_STYLES = {
  selection: {
    width: '20px',
    padding: '2px 10px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  quickAction: {
    width: '12px',
    padding: '2px 0px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  status: {
    width: '50px',
    padding: '0px 0px 0px 10px',
    whiteSpace: 'nowrap',
  },
  date: {
    width: '60px',
    cursor: 'pointer',
    padding: '2px 0px 2px 5px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  category: {
    width: '120px',
    padding: '2px 0px',
    whiteSpace: 'nowrap',
  },
  description: {
    width: 'auto',
    padding: '2px 0px 2px 10px',
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  amount: {
    width: '75px',
    cursor: 'pointer',
    padding: '2px 10px 2px 0px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  balance: {
    width: '75px',
    padding: '2px 10px 2px 0px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  actionMenu: {
    width: '20px',
    textAlign: 'center',
    padding: '2px 0px',
    whiteSpace: 'nowrap',
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
