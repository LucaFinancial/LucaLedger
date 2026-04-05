import { v4 as uuid } from 'uuid';
import { validateSchemaSync } from '@/utils/schemaValidation';

export const generateTransactionLink = (initialData = {}) => {
  const now = new Date().toISOString();

  const transactionLink = {
    id: uuid(),
    sourceTransactionId: initialData.sourceTransactionId || null,
    destinationTransactionId: initialData.destinationTransactionId || null,
    createdAt: now,
    updatedAt: null,
    ...initialData,
  };

  try {
    validateSchemaSync('transactionLink', transactionLink);
    return transactionLink;
  } catch {
    return null;
  }
};
