/**
 * JSON Schema definitions for recurring transaction validation
 *
 * These schemas define the structure and validation rules for recurring transactions.
 * Validated using AJV (Another JSON Schema Validator).
 */

// Valid frequency values
const validFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'];

// Schema for recurring transactions
const recurringTransactionSchema = {
  $id: 'recurringTransaction',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for the recurring transaction',
    },
    accountId: {
      type: 'string',
      minLength: 1,
      description: 'ID of the account this recurring transaction belongs to',
    },
    description: {
      type: 'string',
      minLength: 1,
      description: 'Description of the recurring transaction',
    },
    amount: {
      type: 'number',
      description: 'Transaction amount (can be positive or negative)',
    },
    categoryId: {
      type: ['string', 'null'],
      minLength: 1,
      description: 'Category UUID for this recurring transaction',
    },
    frequency: {
      type: 'string',
      enum: validFrequencies,
      description: 'How often the transaction recurs',
    },
    startDate: {
      type: 'string',
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description:
        'Start date for the recurring transaction in YYYY/MM/DD format',
    },
    endDate: {
      type: ['string', 'null'],
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description:
        'Optional end date for the recurring transaction in YYYY/MM/DD format',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'ISO timestamp when the rule was created',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'ISO timestamp when the rule was last updated',
    },
  },
  required: [
    'id',
    'accountId',
    'description',
    'amount',
    'frequency',
    'startDate',
  ],
  additionalProperties: false,
};

// Schema for recurring transaction occurrences
const recurringOccurrenceSchema = {
  $id: 'recurringOccurrence',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for this occurrence record',
    },
    recurringTransactionId: {
      type: 'string',
      minLength: 1,
      description: 'ID of the recurring transaction rule',
    },
    originalDate: {
      type: 'string',
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description:
        'The originally scheduled date for this occurrence in YYYY/MM/DD format',
    },
    realizedTransactionId: {
      type: 'string',
      minLength: 1,
      description: 'ID of the real transaction created from this occurrence',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'ISO timestamp when the occurrence was created',
    },
  },
  required: [
    'id',
    'recurringTransactionId',
    'originalDate',
    'realizedTransactionId',
  ],
  additionalProperties: false,
};

export const recurringTransactionSchemas = {
  recurringTransaction: recurringTransactionSchema,
  recurringOccurrence: recurringOccurrenceSchema,
};

export default recurringTransactionSchemas;
