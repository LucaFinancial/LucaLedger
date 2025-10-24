import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import PropTypes from 'prop-types';

export default function LoadingOverlay({ open, message = 'Loading...' }) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: 'primary.main' }}
        />
        <Typography
          variant='h6'
          sx={{
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
}

LoadingOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string,
};
