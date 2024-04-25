import { TableCell, Typography } from '@mui/material';
import PropTypes from 'prop-types';

// import CategoryPicker from '@/components/input/CategoryPicker';

export default function CategoryCell({ transaction }) {
  if (transaction.category) {
    console.log(transaction.category);
  }

  return (
    <TableCell>
      {/* <CategoryPicker transaction={transaction} /> */}
      <Typography>ToDo</Typography>
    </TableCell>
  );
}

CategoryCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
