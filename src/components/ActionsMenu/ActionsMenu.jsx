import {
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/accounts';

import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

export default function ActionsMenu({ account }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
    setOpen(false);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    dispatch(actions.removeAccountById(account.id));
    handleClose();
  };

  const handleSave = async (event) => {
    event.stopPropagation();
    await dispatch(
      actions.saveAccountAsync({ account, filename: `${account.name}.json` })
    );
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-label='more'
        aria-controls='long-menu'
        aria-haspopup='true'
        onClick={handleClick}
        style={{
          height: '35px',
          width: '35px',
          position: 'absolute',
          top: '5px',
          right: '5px',
        }}
        sx={{
          '&:hover': {
            backgroundColor: 'darkgray',
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id='long-menu'
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleSave}>
          <ListItemIcon>
            <SaveIcon fontSize='small' />
          </ListItemIcon>
          <Typography variant='inherit'>Save</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' />
          </ListItemIcon>
          <Typography variant='inherit'>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

ActionsMenu.propTypes = {
  account: PropTypes.object.isRequired,
};
