import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { TransactionStatusEnum } from './constants';
import schemas from './schemas';

export const generateTransaction = (initialData = {}) => {
  const transaction = {
    id: uuid(),
    status: TransactionStatusEnum.PLANNED,
    date: dayjs().format(config.dateFormatString),
    amount: 0.0,
    description: 'Enter transaction description',
    ...initialData,
  };

  try {
    schemas.transaction.validateSync(transaction, { abortEarly: false });
    return transaction;
  } catch (error) {
    console.error(error);
    return null;
  }
};
