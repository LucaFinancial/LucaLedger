export const LEDGER_COLUMN_STYLES = {
  selection: {
    width: '20px',
    padding: '2px 10px',
    textAlign: 'center',
  },
  quickAction: {
    width: '12px',
    padding: '2px 0px',
    textAlign: 'center',
  },
  status: {
    width: '50px',
    padding: '0px 0px 0px 10px',
  },
  date: {
    width: '60px',
    cursor: 'pointer',
    padding: '2px 0px 2px 5px',
    textAlign: 'center',
  },
  category: {
    width: '120px',
    padding: '2px 0px',
  },
  description: {
    minWidth: '120px',
    maxWidth: '500px',
    width: '100%',
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
  },
  balance: {
    width: '75px',
    padding: '2px 10px 2px 0px',
    textAlign: 'right',
  },
  actionMenu: {
    width: '20px',
    textAlign: 'center',
    padding: '2px 0px',
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
