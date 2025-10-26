import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import config from '@/config.js';
import categoriesData from '@/config/categories.json';
import { TransactionStatusEnum } from './constants';
import { validateTransactionSync } from '@/validation/validator';

// Get the None category ID from config
const NONE_CATEGORY_ID = categoriesData.categories.find(
  (cat) => cat.slug === 'none'
)?.id;

export const generateTransaction = (initialData = {}) => {
  const transaction = {
    id: uuid(),
    accountId: initialData.accountId || null,
    status: TransactionStatusEnum.PLANNED,
    date: dayjs().format(config.dateFormatString),
    amount: 0,
    description: 'Enter transaction description',
    categoryId: NONE_CATEGORY_ID,
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
