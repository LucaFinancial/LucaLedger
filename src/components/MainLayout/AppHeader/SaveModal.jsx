import {
  Box,
  Button,
  ListItemButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import PropTypes from 'prop-types';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function SaveModal({ closeCb }) {
  const [filename, setFilename] = useState('transactions');
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    closeCb();
  };

  const handleSave = () => {
    handleClose();
  };

  return (
    <>
      <ListItemButton onClick={handleOpen}>Save</ListItemButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Enter a name for your file
          </Typography>
          <Typography variant='body2'>{filename}.json</Typography>
          <TextField
            variant='filled'
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
          />
          <Button variant='contained' onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Modal>
    </>
  );
}

SaveModal.propTypes = {
  closeCb: PropTypes.func.isRequired,
};
