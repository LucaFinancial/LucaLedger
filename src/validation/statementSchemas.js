/**
 * JSON Schema definitions for statement validation
 *
 * These schemas define the structure and validation rules for credit card statements.
 * Validated using AJV (Another JSON Schema Validator).
 */

// Valid statement status values
const validStatuses = ['draft', 'current', 'past', 'locked'];

// Schema for statements
const statementSchema = {
  $id: 'statement',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for the statement',
    },
    accountId: {
      type: 'string',
      minLength: 1,
      description: 'ID of the account this statement belongs to',
    },
    closingDate: {
      type: 'string',
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description: 'Statement closing date in YYYY/MM/DD format',
    },
    periodStart: {
      type: 'string',
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description: 'Period start date (inclusive) in YYYY/MM/DD format',
    },
    periodEnd: {
      type: 'string',
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description: 'Period end date (inclusive) in YYYY/MM/DD format',
    },
    transactionIds: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      description: 'Array of transaction IDs included in this statement',
    },
    total: {
      type: 'number',
      description: 'Statement total in cents',
    },
    status: {
      type: 'string',
      enum: validStatuses,
      description: 'Current status of the statement',
    },
    isStartDateModified: {
      type: 'boolean',
      description: 'Flag indicating if periodStart was manually modified',
    },
    isEndDateModified: {
      type: 'boolean',
      description: 'Flag indicating if periodEnd was manually modified',
    },
    isTotalModified: {
      type: 'boolean',
      description: 'Flag indicating if total was manually modified',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'ISO 8601 timestamp when statement was created',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'ISO 8601 timestamp when statement was last updated',
    },
    lockedAt: {
      type: ['string', 'null'],
      format: 'date-time',
      description: 'ISO 8601 timestamp when statement was locked',
    },
  },
  required: [
    'id',
    'accountId',
    'closingDate',
    'periodStart',
    'periodEnd',
    'transactionIds',
    'total',
    'status',
    'isStartDateModified',
    'isEndDateModified',
    'isTotalModified',
    'createdAt',
    'updatedAt',
  ],
  additionalProperties: false,
};

export const statementSchemas = {
  statement: statementSchema,
};

export default statementSchemas;
