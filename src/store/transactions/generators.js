import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { TransactionStatusEnum } from './constants';
import { validateTransactionSync } from '@/validation/validator';

export const generateTransaction = (initialData = {}) => {
  const transaction = {
    id: uuid(),
    accountId: initialData.accountId || null,
    status: TransactionStatusEnum.PLANNED,
    date: format(new Date(), config.dateFormatString),
    amount: 0,
    description: 'Enter transaction description',
    ...initialData,
  };

  try {
    validateTransactionSync(transaction);
    return transaction;
  } catch (error) {
    console.error(error);
    return null;
  }
};
