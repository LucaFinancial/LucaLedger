import { schemas, validators } from '@luca-financial/luca-schema';
import { values } from 'lodash';

import generateColumnsFromSchema from '../generateColumnsFromSchema';
import constants from '../constants';

export default function useSchemaConfig(schemaKey) {
  if (!schemaKey) {
    throw new Error('schemaKey is required');
  }

  if (!values(constants.SchemaKeys).includes(schemaKey)) {
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
}
