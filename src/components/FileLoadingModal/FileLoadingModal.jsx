import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';

const phaseLabels = {
  reading: 'Reading file...',
  parsing: 'Parsing data...',
  validating: 'Validating structure...',
  complete: 'Loading complete',
};

export default function FileLoadingModal({
  open,
  progress,
  phase,
  onCancel,
  isDeterminate = false,
}) {
  const showProgress = isDeterminate && progress !== null;
  const phaseLabel = phaseLabels[phase] || 'Processing...';

  return (
    <Dialog
      open={open}
      onClose={null}
      disableEscapeKeyDown
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Loading File</DialogTitle>
      <DialogContent>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          gap={2}
          py={2}
        >
          <Typography
            variant='body1'
            color='text.secondary'
          >
            {phaseLabel}
          </Typography>

          {showProgress ? (
            <Box
              width='100%'
              mt={2}
            >
              <LinearProgress
                variant='determinate'
                value={progress}
              />
              <Typography
                variant='caption'
                color='text.secondary'
                align='center'
                display='block'
                mt={1}
              >
                {progress}%
              </Typography>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color='secondary'
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FileLoadingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  progress: PropTypes.number,
  phase: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  isDeterminate: PropTypes.bool,
};
