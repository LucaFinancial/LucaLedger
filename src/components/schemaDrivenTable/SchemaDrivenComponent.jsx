import PropTypes from 'prop-types';
import { values } from 'lodash';

import BooleanCell from './BooleanCell';
import CheckboxCell from './CheckboxCell';
import NumberCell from './NumberCell';
import StringCell from './StringCell';

export const ColumnTypeEnum = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  CHECKBOX: 'checkbox',
});

export default function SchemaDrivenComponent(props) {
  const { column } = props;

  switch (column.type) {
    case ColumnTypeEnum.STRING:
      return <StringCell {...props} />;
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
  }).isRequired,
  actions: PropTypes.object,
  readOnly: PropTypes.bool,
};
