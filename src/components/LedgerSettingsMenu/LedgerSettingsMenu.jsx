import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Settings,
  UnfoldLess,
  UnfoldMore,
  RestartAlt,
  Category,
  Repeat,
  FilterList,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

export default function LedgerSettingsMenu({
  anchorEl,
  open,
  onClose,
  onCollapseAll,
  onExpandAll,
  onReset,
  onAccountSettings,
  onClearInvalidCategories,
  invalidCategoryCount,
  onCreateRepeatedTransactions,
  showUncategorizedOnly,
  onToggleUncategorized,
  uncategorizedCount,
}) {
  const handleMenuItemClick = (callback) => {
    callback();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant='subtitle2'
          color='text.secondary'
        >
          View Controls
        </Typography>
      </Box>
      <MenuItem onClick={() => handleMenuItemClick(onToggleUncategorized)}>
        <ListItemIcon>
          <FilterList fontSize='small' />
        </ListItemIcon>
        <ListItemText>
          {showUncategorizedOnly
            ? 'Show All Transactions'
            : 'Show Only Uncategorized'}
          {uncategorizedCount > 0 && ` (${uncategorizedCount})`}
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleMenuItemClick(onCollapseAll)}>
        <ListItemIcon>
          <UnfoldLess fontSize='small' />
        </ListItemIcon>
        <ListItemText>Collapse All</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleMenuItemClick(onExpandAll)}>
        <ListItemIcon>
          <UnfoldMore fontSize='small' />
        </ListItemIcon>
        <ListItemText>Expand All</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleMenuItemClick(onReset)}>
        <ListItemIcon>
          <RestartAlt fontSize='small' />
        </ListItemIcon>
        <ListItemText>Reset to Default</ListItemText>
      </MenuItem>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant='subtitle2'
          color='text.secondary'
        >
          Account Settings
        </Typography>
      </Box>
      <MenuItem onClick={() => handleMenuItemClick(onAccountSettings)}>
        <ListItemIcon>
          <Settings fontSize='small' />
        </ListItemIcon>
        <ListItemText>Account Settings</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => handleMenuItemClick(onCreateRepeatedTransactions)}
      >
        <ListItemIcon>
          <Repeat fontSize='small' />
        </ListItemIcon>
        <ListItemText>Create Repeated Transactions</ListItemText>
      </MenuItem>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant='subtitle2'
          color='text.secondary'
        >
          Data Actions
        </Typography>
      </Box>
      <MenuItem
        onClick={() => handleMenuItemClick(onClearInvalidCategories)}
        disabled={invalidCategoryCount === 0}
      >
        <ListItemIcon>
          <Category fontSize='small' />
        </ListItemIcon>
        <ListItemText>
          Clear Invalid Categories
          {invalidCategoryCount > 0 && ` (${invalidCategoryCount})`}
        </ListItemText>
      </MenuItem>
    </Menu>
  );
}

LedgerSettingsMenu.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCollapseAll: PropTypes.func.isRequired,
  onExpandAll: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onAccountSettings: PropTypes.func.isRequired,
  onClearInvalidCategories: PropTypes.func.isRequired,
  invalidCategoryCount: PropTypes.number,
  onCreateRepeatedTransactions: PropTypes.func.isRequired,
  showUncategorizedOnly: PropTypes.bool.isRequired,
  onToggleUncategorized: PropTypes.func.isRequired,
  uncategorizedCount: PropTypes.number,
};

LedgerSettingsMenu.defaultProps = {
  invalidCategoryCount: 0,
  uncategorizedCount: 0,
};
