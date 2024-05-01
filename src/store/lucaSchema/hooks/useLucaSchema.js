import { enums, schemas, lucaValidator } from '@luca-financial/luca-schema';

import generateColumnsFromSchema from '../generateColumnsFromSchema';

export default function useLucaSchema(schemaKey) {
  if (!schemaKey) {
    throw new Error('schemaKey is required');
  }

  const schema = schemas[schemaKey];
  const validator = lucaValidator.getSchema(schemaKey);
  const columns = generateColumnsFromSchema(schema);

  return {
    title: schema.title,
    description: schema.description,
    enums,
    schema,
    validator,
    columns,
  };
}
