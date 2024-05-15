import doublePrecisionFormatString from './doublePrecisionFormatString';
import generateColumnsFromSchema from './generateColumnsFromSchema';
import parseFloatDoublePrecision from './parseFloatDoublePrecision';

const ColumnTypeEnum = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  CHECKBOX: 'checkbox',
});

export {
  ColumnTypeEnum,
  doublePrecisionFormatString,
  generateColumnsFromSchema,
  parseFloatDoublePrecision,
};
