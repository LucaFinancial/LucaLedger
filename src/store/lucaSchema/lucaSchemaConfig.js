import addFormats from 'ajv-formats';
import Ajv2020 from 'ajv/dist/2020';
import { values } from 'lodash';

import {
  category,
  entity,
  lucaSchema,
  recurringTransaction,
  recurringTransactionEvent,
  schema,
  transaction,
} from '@luca-financial/luca-schema';

const SchemaKeys = Object.freeze({
  CATEGORY: 'category',
  ENTITY: 'entity',
  LUCASCHEMA: 'lucaSchema',
  RECURRINGTRANSACTION: 'recurringTransaction',
  RECURRINGTRANSACTIONEVENT: 'recurringTransactionEvent',
  SCHEMA: 'schema',
  TRANSACTION: 'transaction',
});

const schemas = {
  [SchemaKeys.CATEGORY]: category,
  [SchemaKeys.ENTITY]: entity,
  [SchemaKeys.LUCASCHEMA]: lucaSchema,
  [SchemaKeys.RECURRINGTRANSACTION]: recurringTransaction,
  [SchemaKeys.RECURRINGTRANSACTIONEVENT]: recurringTransactionEvent,
  [SchemaKeys.SCHEMA]: schema,
  [SchemaKeys.TRANSACTION]: transaction,
};

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

values(SchemaKeys).forEach((key) => {
  ajv.addSchema(schemas[key], key);
});

const validators = Object.fromEntries(
  values(SchemaKeys).map((key) => [key, ajv.compile(schemas[key])])
);

export { SchemaKeys, schemas, validators };
