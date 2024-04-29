import { Paper, Typography } from '@mui/material';
import { values } from 'lodash';
import PropTypes from 'prop-types';

import DynamicColumnsTable from '@comp/tables/DynamicColumnsTable';
import { slices } from '@store';
import { useLucaSchema } from '@store/lucaSchema';
import { ListTypeEnum, useListSlice } from '@store/schemaDrivenSlice';
import SchemaDrivenComponent, { ColumnTypeEnum } from './SchemaDrivenComponent';

export default function SchemaDrivenTable({
  schemaKey,
  displayIsValid = false,
  readOnly = true,
  listType,
}) {
  const { title, columns } = useLucaSchema(schemaKey);
  const { actions, selectors } = useListSlice(slices, schemaKey);
  const data = selectors.selectList(listType);

  if (listType === ListTypeEnum.LOADED) {
    columns.unshift({
      field: 'isSelected',
      title: 'Selected',
      type: ColumnTypeEnum.CHECKBOX,
    });
  }

  if (displayIsValid) {
    columns.push({
      field: 'isValid',
      title: 'Is Valid',
      type: ColumnTypeEnum.BOOLEAN,
    });
  }

  const enhancedColumns = columns.map((column) => ({
    ...column,
    type: Array.isArray(column.type)
      ? column.type.find((type) => type !== 'null')
      : column.type,
    component: (row, column) => (
      <SchemaDrivenComponent
        row={row}
        column={column}
        actions={actions}
        readOnly={readOnly}
      />
    ),
  }));

  return (
    <Paper>
      <h3>{title}</h3>
      {data.length > 0 ? (
        <DynamicColumnsTable
          columns={enhancedColumns}
          data={data}
        />
      ) : (
        <Typography variant='body1'>No {title} to display</Typography>
      )}
    </Paper>
  );
}

SchemaDrivenTable.propTypes = {
  schemaKey: PropTypes.string.isRequired,
  displayIsValid: PropTypes.bool,
  readOnly: PropTypes.bool,
  listType: PropTypes.oneOf(values(ListTypeEnum)).isRequired,
};
