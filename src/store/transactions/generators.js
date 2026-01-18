import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { TransactionStateEnum } from './constants';
import { validateSchemaSync } from '@/utils/schemaValidation';

export const generateTransaction = (initialData = {}) => {
  const transaction = {
    id: uuid(),
    accountId: initialData.accountId || uuid(),
    categoryId: initialData.categoryId || null,
    transactionState: TransactionStateEnum.PLANNED,
    date: format(new Date(), config.dateFormatString),
    amount: 0,
    description: 'Enter transaction description',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    ...initialData,
  };

  try {
    validateSchemaSync('transaction', transaction);
    return transaction;
  } catch (error) {
    console.error(error);
    return null;
  }
};
