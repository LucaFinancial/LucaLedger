import PropTypes from 'prop-types';
import { values } from 'lodash';

import { ColumnTypeEnum } from '@util';
import BooleanCell from './BooleanCell';
import CheckboxCell from './CheckboxCell';
import NumberCell from './NumberCell';
import StringCell from './StringCell';
import DropdownCell from './DropdownCell';

export default function SchemaDrivenComponent(props) {
  const { column } = props;

  const getStringTypeCell = () => {
    if (column.enum) {
      return <DropdownCell {...props} />;
    }
    return <StringCell {...props} />;
  };

  switch (column.type) {
    case ColumnTypeEnum.STRING:
      return getStringTypeCell();
    case ColumnTypeEnum.NUMBER:
      return <NumberCell {...props} />;
    case ColumnTypeEnum.BOOLEAN:
      return <BooleanCell {...props} />;
    case ColumnTypeEnum.CHECKBOX:
      return <CheckboxCell {...props} />;
    default:
      return <div>Unknown column type: {column.type}</div>;
  }
}

SchemaDrivenComponent.propTypes = {
  row: PropTypes.object.isRequired,
  column: PropTypes.shape({
    field: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(values(ColumnTypeEnum)).isRequired,
    enum: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  actions: PropTypes.object,
  readOnly: PropTypes.bool,
};
