/**
 * JSON Schema definitions for transaction validation
 *
 * These schemas define the structure and validation rules for transactions.
 * Validated using AJV (Another JSON Schema Validator).
 */

// Valid transaction status values
const validStatuses = ['pending', 'complete', 'scheduled', 'planned'];

// Schema for split (category allocation within a transaction)
const splitSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for the split',
    },
    categoryId: {
      type: 'string',
      minLength: 1,
      description: 'Category UUID for this split',
    },
    amount: {
      type: 'number',
      exclusiveMinimum: 0,
      description: 'Split amount in integer minor units (cents), must be > 0',
    },
  },
  required: ['id', 'categoryId', 'amount'],
  additionalProperties: false,
};

// Schema for transactions
const transactionSchema = {
  $id: 'transaction',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for the transaction',
    },
    accountId: {
      type: 'string',
      minLength: 1,
      description: 'ID of the account this transaction belongs to',
    },
    status: {
      type: 'string',
      enum: validStatuses,
      description: 'Current status of the transaction',
    },
    date: {
      type: 'string',
      pattern: '^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$',
      description: 'Date of the transaction in YYYY/MM/DD format',
    },
    amount: {
      type: 'number',
      description: 'Transaction amount (can be positive or negative)',
    },
    description: {
      type: 'string',
      minLength: 1,
      description: 'Description of the transaction',
    },
    categoryId: {
      type: ['string', 'null'],
      minLength: 1,
      description: 'Category UUID for this transaction',
    },
    splits: {
      type: 'array',
      items: splitSchema,
      description: 'Optional splits for dividing transaction across categories',
    },
  },
  required: ['id', 'accountId', 'status', 'date', 'amount', 'description'],
  additionalProperties: false,
};

export const transactionSchemas = {
  transaction: transactionSchema,
};

export default transactionSchemas;
