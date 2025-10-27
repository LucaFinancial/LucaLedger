/**
 * JSON Schema definitions for account validation
 *
 * These schemas define the structure and validation rules for different account types.
 * Validated using AJV (Another JSON Schema Validator).
 */

// Common properties shared by all account types
const commonAccountProperties = {
  id: {
    type: 'string',
    minLength: 1,
    description: 'Unique identifier for the account',
  },
  name: {
    type: 'string',
    minLength: 1,
    description: 'Display name for the account',
  },
  type: {
    type: 'string',
    minLength: 1,
    description: 'Account type (Checking, Savings, or Credit Card)',
  },
};

// Schema for Checking and Savings accounts
const commonAccountSchema = {
  $id: 'commonAccount',
  type: 'object',
  properties: commonAccountProperties,
  required: ['id', 'name', 'type'],
  additionalProperties: false,
};

// Schema for Credit Card accounts (extends common schema with statementDay)
const creditCardSchema = {
  $id: 'creditCardAccount',
  type: 'object',
  properties: {
    ...commonAccountProperties,
    statementDay: {
      type: 'integer',
      minimum: 1,
      maximum: 31,
      description: 'Day of month when credit card statement is generated',
    },
  },
  required: ['id', 'name', 'type', 'statementDay'],
  additionalProperties: false,
};

export const accountSchemas = {
  Savings: commonAccountSchema,
  Checking: commonAccountSchema,
  'Credit Card': creditCardSchema,
};

export default accountSchemas;
