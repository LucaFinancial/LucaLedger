import { schemas, lucaValidator } from '@luca-financial/luca-schema';

import generateColumnsFromSchema from '@util/generateColumnsFromSchema';

export default function useLucaSchemaPkg(schemaKey) {
  if (!schemaKey) {
    throw new Error('schemaKey is required');
  }

  const schema = schemas[schemaKey];
  const validator = lucaValidator.getSchema(schemaKey);
  const columns = generateColumnsFromSchema(schema);

  return {
    title: schema.title,
    description: schema.description,
    schema,
    validator,
    columns,
  };
}
