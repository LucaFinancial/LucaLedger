import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';
import CategorySelect from '@/components/CategorySelect';
import { centsToDollars } from '@/utils';

/**
 * SplitItem represents a single category split within a transaction
 */
export default function SplitItem({
  split,
  error,
  onCategoryChange,
  onAmountChange,
  onRemove,
  canRemove,
}) {
  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: error ? '#ffebee' : '#f5f5f5',
        border: error ? '1px solid #f44336' : '1px solid #e0e0e0',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <CategorySelect
            value={split.categoryId}
            onChange={(categoryId) => onCategoryChange(split.id, categoryId)}
            size='small'
            variant='outlined'
            fullWidth
            label='Category'
            placeholder='Select category'
          />
          {error && (
            <Typography
              variant='caption'
              color='error'
              sx={{ mt: 0.5, display: 'block' }}
            >
              {error}
            </Typography>
          )}
        </Box>
        <TextField
          type='text'
          value={
            split.amount === 0 ? '' : centsToDollars(split.amount).toFixed(2)
          }
          onChange={(e) => onAmountChange(split.id, e.target.value)}
          size='small'
          sx={{ width: 150 }}
          label='Amount'
          InputProps={{
            startAdornment: <InputAdornment position='start'>$</InputAdornment>,
          }}
        />
        <IconButton
          onClick={() => onRemove(split.id)}
          disabled={!canRemove}
          color='error'
          size='small'
        >
          <Delete />
        </IconButton>
      </Box>
    </Paper>
  );
}

SplitItem.propTypes = {
  split: PropTypes.shape({
    id: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
  }).isRequired,
  error: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
  onAmountChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired,
};
