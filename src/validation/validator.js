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

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { accountSchemas } from './accountSchemas';
import { transactionSchemas } from './transactionSchemas';

// Create and configure AJV instance
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  useDefaults: true,
  coerceTypes: false,
});

// Add support for string formats (date, email, uri, etc.)
addFormats(ajv);

// Compile schemas for accounts
const accountValidators = {};
Object.keys(accountSchemas).forEach((accountType) => {
  accountValidators[accountType] = ajv.compile(accountSchemas[accountType]);
});

// Compile schema for transactions
const transactionValidator = ajv.compile(transactionSchemas.transaction);

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
 * @param {string} accountType - Type of account (Checking, Savings, or Credit Card)
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateAccount(account, accountType) {
  const validator = accountValidators[accountType];

  if (!validator) {
    return {
      valid: false,
      errors: [`Unknown account type: ${accountType}`],
    };
  }

  const valid = validator(account);

  return {
    valid,
    errors: valid ? [] : formatErrors(validator.errors),
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
  getAjvInstance,
};
