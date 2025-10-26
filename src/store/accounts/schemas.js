/**
 * Account validation schemas using AJV
 *
 * This file provides a compatibility layer for existing code that imports
 * account schemas. The actual schema definitions are in /src/validation/accountSchemas.js
 *
 * @deprecated - Import from @/validation instead for new code
 */

import { AccountType } from './constants';
import { validateAccountSync, validateAccount } from '@/validation/validator';

// Compatibility wrapper to match Yup's validateSync API
class SchemaValidator {
  constructor(accountType) {
    this.accountType = accountType;
  }

  validateSync(account) {
    return validateAccountSync(account, this.accountType);
  }

  async validate(account) {
    const result = validateAccount(account, this.accountType);
    if (!result.valid) {
      const error = new Error(result.errors[0]);
      error.errors = result.errors;
      throw error;
    }
    return account;
  }
}

export default {
  [AccountType.SAVINGS]: new SchemaValidator(AccountType.SAVINGS),
  [AccountType.CHECKING]: new SchemaValidator(AccountType.CHECKING),
  [AccountType.CREDIT_CARD]: new SchemaValidator(AccountType.CREDIT_CARD),
};
