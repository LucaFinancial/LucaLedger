import PropTypes from 'prop-types';
import { values } from 'lodash';

import { ColumnTypeEnum } from '@util';

export default function DropdownCell(props) {
  const { column, row, actions, readOnly } = props;
  const { field, enum: enumOptions } = column;

  console.log('DropdownCell', actions);

  const handleChange = (event) => {
    const { value } = event.target;
    actions.updateItemById(row.id, { [column.field]: value });
  };

  return (
    <select
      value={row[field]}
      onChange={handleChange}
      disabled={readOnly}
    >
      {enumOptions.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}

DropdownCell.propTypes = {
  row: PropTypes.object.isRequired,
  column: PropTypes.shape({
    field: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(values(ColumnTypeEnum)).isRequired,
    enum: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  actions: PropTypes.object,
  readOnly: PropTypes.bool,
};
