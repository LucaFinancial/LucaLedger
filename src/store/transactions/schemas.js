/**
 * Transaction validation schemas using AJV
 *
 * This file provides a compatibility layer for existing code that imports
 * transaction schemas. The actual schema definitions are in /src/validation/transactionSchemas.js
 *
 * @deprecated - Import from @/validation instead for new code
 */

import {
  validateTransactionSync,
  validateTransaction,
} from '@/validation/validator';

// Compatibility wrapper to match Yup's validateSync API
class SchemaValidator {
  validateSync(transaction) {
    return validateTransactionSync(transaction);
  }

  async validate(transaction) {
    const result = validateTransaction(transaction);
    if (!result.valid) {
      const error = new Error(result.errors[0]);
      error.errors = result.errors;
      throw error;
    }
    return transaction;
  }
}

export default {
  transaction: new SchemaValidator(),
};
