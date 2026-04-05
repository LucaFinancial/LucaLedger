import { v4 as uuid } from 'uuid';
import { validateSchemaSync } from '@/utils/schemaValidation';

export const generateRecurringTransactionLink = (initialData = {}) => {
  const now = new Date().toISOString();

  const recurringTransactionLink = {
    id: uuid(),
    sourceRecurringTransactionId:
      initialData.sourceRecurringTransactionId || null,
    destinationRecurringTransactionId:
      initialData.destinationRecurringTransactionId || null,
    createdAt: now,
    updatedAt: null,
    ...initialData,
  };

  try {
    validateSchemaSync('recurringTransactionLink', recurringTransactionLink);
    return recurringTransactionLink;
  } catch {
    return null;
  }
};
