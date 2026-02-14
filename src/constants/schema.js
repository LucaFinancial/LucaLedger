import { lucaSchema } from '@luca-financial/luca-schema';

const contractVersion = lucaSchema?.properties?.schemaVersion?.const;

export const CURRENT_SCHEMA_VERSION =
  typeof contractVersion === 'string' ? contractVersion : '3.0.0';
