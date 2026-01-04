/**
 * AJV Validator Utility
 *
 * Provides a configured AJV instance and helper functions for validating
 * data against JSON schemas throughout the application.
 *
 * Configuration:
 * - strict: true - Enforces strict schema validation
 * - allErrors: true - Collects all validation errors, not just the first
 * - useDefaults: true - Applies default values from schemas
 * - coerceTypes: false - No automatic type coercion for better type safety
 *
 * Usage:
 *   import { validateAccount, validateTransaction } from '@/validation/validator';
 *
 *   const result = validateAccount(accountData, 'Checking');
 *   if (!result.valid) {
 *     console.error(result.errors);
 *   }
 */

import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { schemas } from '@luca-financial/luca-schema';
import { statementSchemas } from './statementSchemas';

// Create and configure AJV instance
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  useDefaults: true,
  coerceTypes: false,
  removeAdditional: true,
});

// Add support for string formats (date, email, uri, etc.)
addFormats(ajv);

// Add common schema which is referenced by others
ajv.addSchema(schemas.common);

// Compile schemas
const accountValidator = ajv.compile(schemas.account);
const transactionValidator = ajv.compile(schemas.transaction);
const categoryValidator = ajv.compile(schemas.category);
const recurringTransactionValidator = ajv.compile(schemas.recurringTransaction);
const recurringOccurrenceValidator = ajv.compile(
  schemas.recurringTransactionEvent
);
const statementValidator = ajv.compile(statementSchemas.statement);

/**
 * Formats AJV errors into user-friendly messages
 * @param {Array} errors - Array of AJV error objects
 * @returns {Array} Array of formatted error messages
 */
function formatErrors(errors) {
  if (!errors || errors.length === 0) return [];

  return errors.map((err) => {
    const field =
      err.instancePath.replace(/^\//, '') || err.params.missingProperty;

    switch (err.keyword) {
      case 'required':
        return `${err.params.missingProperty} is required`;
      case 'type':
        return `${field} must be a ${err.params.type}`;
      case 'minLength':
        return `${field} must not be empty`;
      case 'minimum':
        return `${field} must be at least ${err.params.limit}`;
      case 'maximum':
        return `${field} must be at most ${err.params.limit}`;
      case 'enum':
        return `${field} must be one of: ${err.params.allowedValues.join(
          ', '
        )}`;
      case 'format':
        return `${field} must be a valid ${err.params.format}`;
      case 'additionalProperties':
        return `Unknown property: ${err.params.additionalProperty}`;
      default:
        return err.message || 'Validation error';
    }
  });
}

/**
 * Validates an account against its schema
 * @param {Object} account - Account data to validate
 * @param {string} [accountType] - Deprecated: Type of account (ignored in new schema)
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateAccount(account, accountType) {
  const valid = accountValidator(account);

  return {
    valid,
    errors: valid ? [] : formatErrors(accountValidator.errors),
  };
}

/**
 * Validates an account and throws an error if invalid (sync behavior like Yup)
 * @param {Object} account - Account data to validate
 * @param {string} accountType - Type of account
 * @throws {Error} Validation error with details
 */
export function validateAccountSync(account, accountType) {
  const result = validateAccount(account, accountType);

  if (!result.valid) {
    const error = new Error(result.errors[0]);
    error.errors = result.errors;
    throw error;
  }

  return account;
}

/**
 * Validates a transaction against its schema
 * @param {Object} transaction - Transaction data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateTransaction(transaction) {
  const valid = transactionValidator(transaction);

  return {
    valid,
    errors: valid ? [] : formatErrors(transactionValidator.errors),
  };
}

/**
 * Validates a transaction and throws an error if invalid (sync behavior like Yup)
 * @param {Object} transaction - Transaction data to validate
 * @throws {Error} Validation error with details
 */
export function validateTransactionSync(transaction) {
  const result = validateTransaction(transaction);

  if (!result.valid) {
    const error = new Error(result.errors[0]);
    error.errors = result.errors;
    throw error;
  }

  return transaction;
}

/**
 * Validates a category against its schema
 * @param {Object} category - Category data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateCategory(category) {
  const valid = categoryValidator(category);

  return {
    valid,
    errors: valid ? [] : formatErrors(categoryValidator.errors),
  };
}

/**
 * Validates a category and throws an error if invalid
 * @param {Object} category - Category data to validate
 * @throws {Error} Validation error with details
 */
export function validateCategorySync(category) {
  const result = validateCategory(category);

  if (!result.valid) {
    const error = new Error(result.errors[0]);
    error.errors = result.errors;
    throw error;
  }

  return category;
}

/**
 * Validates a statement against its schema
 * @param {Object} statement - Statement data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateStatement(statement) {
  const valid = statementValidator(statement);

  return {
    valid,
    errors: valid ? [] : formatErrors(statementValidator.errors),
  };
}

/**
 * Validates a statement and throws an error if invalid
 * @param {Object} statement - Statement data to validate
 * @throws {Error} Validation error with details
 */
export function validateStatementSync(statement) {
  const result = validateStatement(statement);

  if (!result.valid) {
    const error = new Error(result.errors[0]);
    error.errors = result.errors;
    throw error;
  }

  return statement;
}

/**
 * Validates a recurring transaction against its schema
 * @param {Object} recurringTransaction - Recurring transaction data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateRecurringTransaction(recurringTransaction) {
  const valid = recurringTransactionValidator(recurringTransaction);

  return {
    valid,
    errors: valid ? [] : formatErrors(recurringTransactionValidator.errors),
  };
}

/**
 * Validates a recurring transaction and throws an error if invalid
 * @param {Object} recurringTransaction - Recurring transaction data to validate
 * @throws {Error} Validation error with details
 */
export function validateRecurringTransactionSync(recurringTransaction) {
  const result = validateRecurringTransaction(recurringTransaction);

  if (!result.valid) {
    const error = new Error(result.errors[0]);
    error.errors = result.errors;
    throw error;
  }

  return recurringTransaction;
}

/**
 * Validates a recurring occurrence against its schema
 * @param {Object} occurrence - Recurring occurrence data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateRecurringOccurrence(occurrence) {
  const valid = recurringOccurrenceValidator(occurrence);

  return {
    valid,
    errors: valid ? [] : formatErrors(recurringOccurrenceValidator.errors),
  };
}

/**
 * Validates a recurring occurrence and throws an error if invalid
 * @param {Object} occurrence - Recurring occurrence data to validate
 * @throws {Error} Validation error with details
 */
export function validateRecurringOccurrenceSync(occurrence) {
  const result = validateRecurringOccurrence(occurrence);

  if (!result.valid) {
    const error = new Error(result.errors[0]);
    error.errors = result.errors;
    throw error;
  }

  return occurrence;
}

/**
 * Gets the AJV instance for advanced use cases
 * @returns {Ajv} Configured AJV instance
 */
export function getAjvInstance() {
  return ajv;
}

export default {
  validateAccount,
  validateAccountSync,
  validateTransaction,
  validateTransactionSync,
  validateCategory,
  validateCategorySync,
  validateStatement,
  validateStatementSync,
  validateRecurringTransaction,
  validateRecurringTransactionSync,
  validateRecurringOccurrence,
  validateRecurringOccurrenceSync,
  getAjvInstance,
};
