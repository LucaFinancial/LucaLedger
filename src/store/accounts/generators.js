import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { validateAccountSync } from '@/validation/validator';

export const generateAccount = (initialData = {}) => {
  const accountType = initialData.type || AccountType.CHECKING;
  const account = {
    id: uuid(),
    type: accountType,
    ...initialData,
  };
  validateAccountSync(account, accountType);
  return account;
};

export const generateNewCheckingAccount = () =>
  generateAccount({ type: AccountType.CHECKING });

export const generateNewSavingsAccount = () =>
  generateAccount({ type: AccountType.SAVINGS });

export const generateNewCreditCardAccount = () =>
  generateAccount({ type: AccountType.CREDIT_CARD, statementDay: 1 });

export const generateAccountObject = (id, name, type, statementDay) => ({
  id,
  name,
  type,
  statementDay,
});
