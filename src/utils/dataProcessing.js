import {
  lucaSchema,
  schemas,
  stripInvalidFields,
  validateCollection,
} from '@luca-financial/luca-schema';
import { format } from 'date-fns';
import { migrateDataToSchema } from '@/utils/dataMigration';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

const LUCA_SCHEMAS = Object.entries(lucaSchema?.properties || {}).reduce(
  (acc, [collectionName, definition]) => {
    if (collectionName === 'schemaVersion') return acc;
    const ref = definition?.items?.$ref;
    const match = typeof ref === 'string' ? ref.match(/([^/]+)\.json$/) : null;
    if (match) {
      acc[collectionName] = match[1];
    }
    return acc;
  },
  {},
);

const cloneDefault = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  if (value && typeof value === 'object') {
    return JSON.parse(JSON.stringify(value));
  }
  return value;
};

const getSchemaProperties = (schemaKey) => {
  const schema = schemas?.[schemaKey];
  if (!schema) return {};
  const properties = schema.properties ?? {};
  const hasCommon = Array.isArray(schema.allOf)
    ? schema.allOf.some((entry) =>
        typeof entry?.$ref === 'string'
          ? entry.$ref.includes('common.json')
          : false,
      )
    : false;

  if (!hasCommon) return properties;
  const commonProps = schemas?.common?.properties ?? {};
  return { ...commonProps, ...properties };
};

const getSchemaRequiredFields = (schemaKey) => {
  const schema = schemas?.[schemaKey];
  if (!schema) return [];
  const required = Array.isArray(schema.required) ? schema.required : [];
  const hasCommon = Array.isArray(schema.allOf)
    ? schema.allOf.some((entry) =>
        typeof entry?.$ref === 'string'
          ? entry.$ref.includes('common.json')
          : false,
      )
    : false;

  if (!hasCommon) return required;
  const commonRequired = Array.isArray(schemas?.common?.required)
    ? schemas.common.required
    : [];
  return [...commonRequired, ...required];
};

const applyDefaultsFromSchema = (schemaKey, entity, fieldsToDefault = null) => {
  if (entity === null || entity === undefined) return {};
  if (typeof entity !== 'object' || Array.isArray(entity)) return entity;

  const properties = getSchemaProperties(schemaKey);
  const next = { ...entity };

  Object.entries(properties).forEach(([key, definition]) => {
    if (fieldsToDefault && !fieldsToDefault.has(key)) return;
    if (
      definition &&
      Object.prototype.hasOwnProperty.call(definition, 'default')
    ) {
      next[key] = cloneDefault(definition.default);
    }
  });

  return next;
};

const parseSchemaVersion = (version) => {
  if (typeof version !== 'string') return null;
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const compareVersions = (v1, v2) => {
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  return v1.patch - v2.patch;
};

const validateAllCollections = (data) => {
  const allErrors = [];
  let allValid = true;

  Object.entries(LUCA_SCHEMAS).forEach(([collectionName, schemaKey]) => {
    const collection = data[collectionName] || [];
    if (collection.length === 0) return;

    const result = validateCollection(schemaKey, collection);
    if (!result.valid) {
      allValid = false;
      result.errors.forEach((error) => {
        allErrors.push({
          collection: collectionName,
          schemaKey,
          entity: collection[error.index],
          ...error,
        });
      });
    }
  });

  return { valid: allValid, errors: allErrors };
};

const stripInvalidFieldsFromErrors = (data) => {
  let changed = false;
  const cleaned = {};

  Object.entries(LUCA_SCHEMAS).forEach(([collectionName, schemaKey]) => {
    const collection = data[collectionName] || [];
    cleaned[collectionName] = collection.map((entity) => {
      const stripped = stripInvalidFields(schemaKey, entity);
      if (JSON.stringify(stripped) !== JSON.stringify(entity)) {
        changed = true;
      }
      return stripped;
    });
  });

  return { data: cleaned, changed };
};

const buildInvalidIndexMap = (errors) =>
  errors.reduce((acc, error) => {
    if (!error.collection) return acc;
    if (!acc[error.collection]) {
      acc[error.collection] = new Set();
    }
    acc[error.collection].add(error.index);
    return acc;
  }, {});

const buildInvalidFieldMap = (errors) =>
  errors.reduce((acc, error) => {
    if (!error.collection) return acc;
    if (!acc[error.collection]) {
      acc[error.collection] = new Map();
    }
    const fieldSet = acc[error.collection].get(error.index) || new Set();
    const details = Array.isArray(error.errors) ? error.errors : [];

    details.forEach((detail) => {
      if (!detail) return;
      const path =
        typeof detail.instancePath === 'string' ? detail.instancePath : '';
      if (path) {
        const field = path.replace(/^\//, '').split('/')[0];
        if (field) fieldSet.add(field);
      }
      if (detail.keyword === 'required' && detail.params?.missingProperty) {
        fieldSet.add(detail.params.missingProperty);
      }
    });

    acc[error.collection].set(error.index, fieldSet);
    return acc;
  }, {});

const applyDefaultsToInvalidValues = (data, errors) => {
  const invalidFieldsByCollection = buildInvalidFieldMap(errors);

  let changed = false;
  const cleaned = { ...data };

  Object.entries(LUCA_SCHEMAS).forEach(([collectionName, schemaKey]) => {
    const collection = data[collectionName] || [];
    const invalidFields = invalidFieldsByCollection[collectionName];
    if (!invalidFields || invalidFields.size === 0) {
      cleaned[collectionName] = collection;
      return;
    }

    cleaned[collectionName] = collection.map((entity, index) => {
      if (!invalidFields.has(index)) {
        return entity;
      }
      const fieldsToDefault = invalidFields.get(index);
      const normalizedFields =
        fieldsToDefault && fieldsToDefault.size > 0 ? fieldsToDefault : null;
      const withDefaults = applyDefaultsFromSchema(
        schemaKey,
        entity,
        normalizedFields,
      );
      if (JSON.stringify(withDefaults) !== JSON.stringify(entity)) {
        changed = true;
      }
      return withDefaults;
    });
  });

  return { data: cleaned, changed };
};

const applyDefaultsForMissingRequiredFields = (data) => {
  let changed = false;
  const cleaned = { ...data };

  Object.entries(LUCA_SCHEMAS).forEach(([collectionName, schemaKey]) => {
    const collection = data[collectionName] || [];
    if (collection.length === 0) {
      cleaned[collectionName] = collection;
      return;
    }

    const requiredFields = getSchemaRequiredFields(schemaKey);
    const properties = getSchemaProperties(schemaKey);

    cleaned[collectionName] = collection.map((entity) => {
      if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
        return entity;
      }

      const missingWithDefaults = new Set(
        requiredFields.filter(
          (field) =>
            entity[field] === undefined &&
            Object.prototype.hasOwnProperty.call(properties[field] || {}, 'default'),
        ),
      );

      if (missingWithDefaults.size === 0) {
        return entity;
      }

      const withDefaults = applyDefaultsFromSchema(
        schemaKey,
        entity,
        missingWithDefaults,
      );
      if (JSON.stringify(withDefaults) !== JSON.stringify(entity)) {
        changed = true;
      }
      return withDefaults;
    });
  });

  return { data: cleaned, changed };
};

export const removeInvalidObjects = (data, errors) => {
  const invalidIndicesByCollection = buildInvalidIndexMap(errors);

  const cleaned = {};
  let removedCount = 0;

  Object.entries(LUCA_SCHEMAS).forEach(([collectionName]) => {
    const collection = data[collectionName] || [];
    const invalidIndices = invalidIndicesByCollection[collectionName];
    if (!invalidIndices || invalidIndices.size === 0) {
      cleaned[collectionName] = collection;
      return;
    }

    cleaned[collectionName] = collection.filter((_, index) => {
      if (invalidIndices.has(index)) {
        removedCount += 1;
        return false;
      }
      return true;
    });
  });

  return { data: cleaned, removedCount };
};

export const processLoadedData = (rawData, options = {}) => {
  const schemaVersion = rawData.schemaVersion ?? options.schemaVersion;
  if (!schemaVersion) {
    throw new Error(
      'Invalid file format: No schema version found. File must contain a "schemaVersion" field.',
    );
  }

  const parsedVersion = parseSchemaVersion(schemaVersion);
  if (!parsedVersion) {
    throw new Error(
      `Invalid schema version format: ${schemaVersion}. Expected a semantic version like 2.1.0.`,
    );
  }

  const currentVersion = parseSchemaVersion(CURRENT_SCHEMA_VERSION);
  if (!currentVersion) {
    throw new Error('Invalid current schema version configuration.');
  }

  let changed = false;
  let removedRecords = 0;

  // 1. Remove past recurring transaction events FIRST
  const today = format(new Date(), 'yyyy-MM-dd');
  const recurringEvents = rawData.recurringTransactionEvents || [];
  const filteredEvents = recurringEvents.filter(
    (event) => event.expectedDate >= today,
  );
  removedRecords = recurringEvents.length - filteredEvents.length;
  if (removedRecords > 0) {
    changed = true;
  }

  // Build normalized data object
  let data = {
    accounts: rawData.accounts || [],
    transactions: rawData.transactions || [],
    categories: rawData.categories || [],
    statements: rawData.statements || [],
    recurringTransactions: rawData.recurringTransactions || [],
    recurringTransactionEvents: filteredEvents,
    transactionSplits: rawData.transactionSplits || [],
  };

  // 2. Validate collections
  let validation = validateAllCollections(data);

  // 3. Migrate if needed
  if (compareVersions(parsedVersion, currentVersion) < 0) {
    const migrated = migrateDataToSchema(data, {
      timestamp: new Date().toISOString(),
    });
    if (migrated.changed) {
      changed = true;
      data = migrated.data;
    }
  }

  // 4. Validate again
  validation = validateAllCollections(data);

  // 5. If validation still fails, strip invalid fields (and apply defaults if permitted)
  if (!validation.valid) {
    const stripped = stripInvalidFieldsFromErrors(data);
    if (stripped.changed) {
      changed = true;
    }
    data = stripped.data;

    const autoDefaults = applyDefaultsForMissingRequiredFields(data);
    if (autoDefaults.changed) {
      changed = true;
    }
    data = autoDefaults.data;

    const postStripValidation = validateAllCollections(data);
    if (!postStripValidation.valid && options.applyDefaults) {
      const defaulted = applyDefaultsToInvalidValues(
        data,
        postStripValidation.errors,
      );
      if (defaulted.changed) {
        changed = true;
      }
      data = defaulted.data;
    }
  }

  // 6. Validate again
  const finalValidation = validateAllCollections(data);

  return {
    data,
    changed,
    errors: finalValidation.valid ? [] : finalValidation.errors,
    removedRecords,
  };
};
