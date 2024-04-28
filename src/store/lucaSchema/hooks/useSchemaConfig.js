import { values } from 'lodash';

import generateColumnsFromSchema from '../generateColumnsFromSchema';
import { SchemaKeys, schemas, validators } from '../lucaSchemaConfig';
import constants from '../lucaSchemaConstants';

export const useSchemaConfig = (schemaKey) => {
  if (!schemaKey) {
    throw new Error('schemaKey is required');
  }

  if (!values(SchemaKeys).includes(schemaKey)) {
    throw new Error(`Invalid schemaKey: ${schemaKey}`);
  }

  const schema = schemas[schemaKey];
  const validator = validators[schemaKey];
  const columns = generateColumnsFromSchema(schema);

  return {
    title: schema.title,
    description: schema.description,
    constants,
    schema,
    validator,
    columns,
  };
};
