import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

const formatErrorDetail = (error) => {
  const details = Array.isArray(error.errors) ? error.errors : [];
  if (details.length === 0) {
    return [{ field: '', message: error.message || 'Invalid data' }];
  }

  return details.map((detail) => ({
    field:
      detail.instancePath?.replace(/^\//, '') ||
      detail.dataPath?.replace(/^\./, '') ||
      detail.params?.additionalProperty ||
      detail.params?.unevaluatedProperty ||
      '',
    message: detail.message || 'Invalid data',
  }));
};

export default function ValidationErrorsDialog({
  open,
  errors,
  onDownloadJson,
  onApplyDefaults,
  onRemoveInvalid,
  onCancel,
}) {
  return (
    <Dialog open={open} maxWidth='md' fullWidth>
      <DialogTitle>Validation Errors Found</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 2 }}>
          Some data does not match the schema. Review the issues below.
        </Typography>

        <List dense>
          {errors.map((error, index) => {
            const details = formatErrorDetail(error);
            const entityId = error.entity?.id
              ? ` (id: ${error.entity.id})`
              : '';
            return details.map((detail, detailIndex) => (
              <ListItem key={`${index}-${detailIndex}`} alignItems='flex-start'>
                <ListItemText
                  primary={`${error.collection} [${error.index}]${entityId} ${detail.field || ''}`}
                  secondary={detail.message}
                />
              </ListItem>
            ));
          })}
        </List>

        <Alert severity='warning' sx={{ mt: 2 }}>
          Continuing with invalid data may cause additional problems.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Button onClick={onDownloadJson}>Download JSON</Button>
        <Button onClick={onApplyDefaults}>Apply Defaults</Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant='contained' color='warning' onClick={onRemoveInvalid}>
          Remove Invalid Objects
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ValidationErrorsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  errors: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDownloadJson: PropTypes.func.isRequired,
  onApplyDefaults: PropTypes.func.isRequired,
  onRemoveInvalid: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
