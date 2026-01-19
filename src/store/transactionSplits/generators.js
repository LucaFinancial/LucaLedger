import { v4 as uuid } from 'uuid';
import { validateSchemaSync } from '@/utils/schemaValidation';

export const generateTransactionSplit = (initialData = {}) => {
  const now = new Date().toISOString();
  const split = {
    id: uuid(),
    transactionId: initialData.transactionId,
    amount: initialData.amount,
    categoryId: initialData.categoryId ?? null,
    description: initialData.description ?? null,
    memo: initialData.memo ?? null,
    createdAt: now,
    updatedAt: null,
    ...initialData,
  };

  try {
    validateSchemaSync('transactionSplit', split);
    return split;
  } catch (error) {
    console.error('Transaction split validation failed:', error);
    return null;
  }
};
