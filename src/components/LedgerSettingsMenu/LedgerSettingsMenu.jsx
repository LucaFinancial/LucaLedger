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
  Edit,
  Category,
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
  onBulkEdit,
  onClearInvalidCategories,
  selectedCount,
  invalidCategoryCount,
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

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant='subtitle2'
          color='text.secondary'
        >
          Bulk Actions
        </Typography>
      </Box>
      <MenuItem
        onClick={() => handleMenuItemClick(onBulkEdit)}
        disabled={selectedCount === 0}
      >
        <ListItemIcon>
          <Edit fontSize='small' />
        </ListItemIcon>
        <ListItemText>
          {selectedCount === 0
            ? 'Edit Transactions'
            : selectedCount === 1
            ? 'Edit 1 Transaction'
            : `Edit ${selectedCount} Transactions`}
        </ListItemText>
      </MenuItem>
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
  onBulkEdit: PropTypes.func.isRequired,
  onClearInvalidCategories: PropTypes.func.isRequired,
  selectedCount: PropTypes.number,
  invalidCategoryCount: PropTypes.number,
};
