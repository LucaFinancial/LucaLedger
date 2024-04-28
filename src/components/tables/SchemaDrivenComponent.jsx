import PropTypes from 'prop-types';
import { values } from 'lodash';

import TableRowCheckbox from '@c/input/TableRowCheckbox';

export const ColumnTypeEnum = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  CHECKBOX: 'checkbox',
});

export default function SchemaDrivenComponent({
  row,
  column,
  actions,
  readOnly = true,
}) {
  if (column.type === 'string,null') {
    console.log('bad', column, row);
  }
  const StringComponent = <div>{row[column.field]}</div>;
  const NumberComponent = <div>{row[column.field]}</div>;
  const BooleanComponent = <div>{String(row[column.field])}</div>;
  const CheckboxComponent = (
    <TableRowCheckbox
      row={row}
      toggleIsSelected={actions.toggleIsSelected}
    />
  );

  if (readOnly) {
    switch (column.type) {
      case ColumnTypeEnum.STRING:
        return StringComponent;
      case ColumnTypeEnum.NUMBER:
        return NumberComponent;
      case ColumnTypeEnum.BOOLEAN:
        return BooleanComponent;
      case ColumnTypeEnum.CHECKBOX:
        return CheckboxComponent;
      default:
        return <div>Unknown column type: {column.type}</div>;
    }
  }

  switch (column.type) {
    case ColumnTypeEnum.STRING:
      return StringComponent;
    case ColumnTypeEnum.NUMBER:
      return NumberComponent;
    case ColumnTypeEnum.BOOLEAN:
      return BooleanComponent;
    case ColumnTypeEnum.CHECKBOX:
      return CheckboxComponent;
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
