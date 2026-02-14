import { lucaSchema } from '@luca-financial/luca-schema';

const contractVersion = lucaSchema?.properties?.schemaVersion?.const;

if (typeof contractVersion !== 'string' || contractVersion.length === 0) {
  throw new Error(
    'Invalid Luca schema contract: expected lucaSchema.properties.schemaVersion.const to be a non-empty string.',
  );
}

export const CURRENT_SCHEMA_VERSION = contractVersion;
