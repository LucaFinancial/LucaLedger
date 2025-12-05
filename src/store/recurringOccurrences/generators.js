import { v4 as uuid } from 'uuid';
import { validateRecurringOccurrenceSync } from '@/validation/validator';

/**
 * Generates a new recurring occurrence record
 * @param {Object} initialData - Initial data to populate the occurrence
 * @param {string} initialData.recurringTransactionId - Required: ID of the recurring transaction rule
 * @param {string} initialData.originalDate - Required: Original scheduled date
 * @param {string} initialData.realizedTransactionId - Required: ID of the realized transaction
 * @returns {Object|null} The generated occurrence or null if validation fails
 */
export const generateRecurringOccurrence = (initialData = {}) => {
  const now = new Date().toISOString();

  const occurrence = {
    id: uuid(),
    recurringTransactionId: initialData.recurringTransactionId,
    originalDate: initialData.originalDate,
    realizedTransactionId: initialData.realizedTransactionId,
    createdAt: now,
    ...initialData,
  };

  try {
    validateRecurringOccurrenceSync(occurrence);
    return occurrence;
  } catch (error) {
    console.error('Recurring occurrence validation failed:', error);
    return null;
  }
};
