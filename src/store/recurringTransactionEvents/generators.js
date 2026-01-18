import { v4 as uuid } from 'uuid';
import { validateSchemaSync } from '@/utils/schemaValidation';

export const generateRecurringTransactionEvent = (initialData = {}) => {
  const now = new Date().toISOString();

  const event = {
    id: uuid(),
    recurringTransactionId: initialData.recurringTransactionId,
    expectedDate: initialData.expectedDate,
    eventState: initialData.eventState,
    transactionId: initialData.transactionId ?? null,
    createdAt: now,
    updatedAt: null,
    ...initialData,
  };

  try {
    validateSchemaSync('recurringTransactionEvent', event);
    return event;
  } catch (error) {
    console.error('Recurring transaction event validation failed:', error);
    return null;
  }
};
