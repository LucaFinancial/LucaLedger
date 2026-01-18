import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { validateSchemaSync } from '@/utils/schemaValidation';

export const generateAccount = (initialData = {}) => {
  const accountType = initialData.type || AccountType.CHECKING;
  const account = {
    id: uuid(),
    type: accountType,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    ...initialData,
  };
  validateSchemaSync('account', account);
  return account;
};

export const generateNewCheckingAccount = () =>
  generateAccount({ type: AccountType.CHECKING });

export const generateNewSavingsAccount = () =>
  generateAccount({ type: AccountType.SAVINGS });

export const generateNewCreditCardAccount = () =>
  generateAccount({ type: AccountType.CREDIT_CARD, statementClosingDay: 1 });

export const generateAccountObject = (id, name, type, statementClosingDay) => ({
  id,
  name,
  type,
  statementClosingDay,
  createdAt: new Date().toISOString(),
  updatedAt: null,
});
