import { validate } from '@luca-financial/luca-schema';

export const validateSchema = (schemaKey, data) => validate(schemaKey, data);

export const validateSchemaSync = (schemaKey, data) => {
  const result = validate(schemaKey, data);
  if (!result.valid) {
    const firstError = result.errors?.[0]?.message || 'Validation error';
    const error = new Error(firstError);
    error.errors = result.errors ?? [];
    throw error;
  }
  return data;
};
