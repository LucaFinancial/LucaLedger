import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import CheckboxInput from '@comp/core/CheckboxInput';

export default function TableRowCheckbox({ row, toggleIsSelected }) {
  const dispatch = useDispatch();

  const handleChange = () => {
    const updatedItem = { ...row, isSelected: !row.isSelected };
    dispatch(toggleIsSelected(row.id, updatedItem));
  };

  return (
    <CheckboxInput
      value={row.isSelected}
      onChange={handleChange}
    />
  );
}

TableRowCheckbox.propTypes = {
  row: PropTypes.object.isRequired,
  toggleIsSelected: PropTypes.func.isRequired,
};
