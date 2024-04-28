import { schemas, validators } from '@luca-financial/luca-schema';

const SchemaKeys = Object.freeze({
  CATEGORY: 'category',
  ENTITY: 'entity',
  LUCASCHEMA: 'lucaSchema',
  RECURRINGTRANSACTION: 'recurringTransaction',
  RECURRINGTRANSACTIONEVENT: 'recurringTransactionEvent',
  SCHEMA: 'schema',
  TRANSACTION: 'transaction',
});

export { SchemaKeys, schemas, validators };
