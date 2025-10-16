import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import schemas from './schemas';

export const generateAccount = (initialData = {}) => {
  const accountType = initialData.type || AccountType.CHECKING;
  const account = {
    id: uuid(),
    type: accountType,
    ...initialData,
  };
  schemas[accountType].validateSync(account);
  return account;
};

export const generateNewCheckingAccount = () =>
  generateAccount({ type: AccountType.CHECKING });

export const generateNewSavingsAccount = () =>
  generateAccount({ type: AccountType.SAVINGS });

export const generateNewCreditCardAccount = () =>
  generateAccount({ type: AccountType.CREDIT_CARD, statementDay: 1 });

export const generateAccountObject = (id, name, type, statementDay) => ({
  version: '1.0.0',
  id,
  name,
  type,
  statementDay,
});
