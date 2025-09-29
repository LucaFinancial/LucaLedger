import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { constants as categoryConstants, selectors } from '@/store/categories';
import {
  actions,
  constants as transactionConstants,
} from '@/store/transactions';

export default function CategoryPicker({ transaction }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(
    transaction.categoryId || categoryConstants.DefaultCategory.id
  );
  const categories = useSelector(selectors.selectCategories);

  const handleChange = (event) => {
    const { value } = event.target;
    dispatch(
      actions.updateTransactionProperty(
        accountId,
        transaction,
        transactionConstants.TransactionFields.CATEGORY,
        value
      )
    );
    setSelectedCategory(value);
  };

  return (
    <FormControl
      sx={{ width: '125px' }}
      variant='standard'
      fullWidth
    >
      <InputLabel id='category-picker-label'>Category</InputLabel>
      <Select
        labelId='category-picker-label'
        id='category-picker'
        label='Category'
        value={selectedCategory}
        onChange={handleChange}
      >
        <MenuItem
          key={categoryConstants.DefaultCategory.id}
          value={categoryConstants.DefaultCategory.id}
        >
          {categoryConstants.DefaultCategory.name}
        </MenuItem>
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            value={category.id}
          >
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

CategoryPicker.propTypes = {
  transaction: PropTypes.object.isRequired,
};
