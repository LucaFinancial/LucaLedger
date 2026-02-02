import { describe, it, expect } from 'vitest';
import { addDays, format } from 'date-fns';

import { processLoadedData } from '@/utils/dataProcessing';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

const buildRecurringTransaction = (accountId, categoryId) => ({
  id: '00000000-0000-0000-0000-000000000111',
  accountId,
  description: 'Monthly subscription',
  amount: 1299,
  categoryId,
  frequency: 'MONTH',
  interval: 1,
  startOn: '2024-01-01',
  endOn: null,
  recurringTransactionState: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const buildRecurringEvent = (id, expectedDate, transactionId) => ({
  id,
  recurringTransactionId: '00000000-0000-0000-0000-000000000111',
  expectedDate,
  eventState: 'MODIFIED',
  transactionId,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
});

describe('processLoadedData', () => {
  it('strips invalid fields and removes past recurring events', () => {
    const today = new Date();
    const yesterday = format(addDays(today, -1), 'yyyy-MM-dd');
    const tomorrow = format(addDays(today, 1), 'yyyy-MM-dd');

    const validCheckingAccount = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Primary Checking',
      type: 'CHECKING',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: null,
    };

    const validParentCategory = {
      id: '00000000-0000-0000-0000-000000000101',
      slug: 'test-parent',
      name: 'Test Parent Category',
      parentId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: null,
    };

    const transactionWithInvalidField = {
      id: 'a2d18fe6-7220-44d2-9127-55568d39a2a8',
      accountId: '5c23e01c-5969-435e-b296-deba61630ef5',
      date: '2026-03-09',
      amount: -29142,
      description: 'Visa Payment',
      categoryId: '00000010-0000-0000-0000-000000000001',
      transactionState: 'recurring',
      isVirtual: true,
      recurringTransactionId: '1a32733c-345d-445c-b7c8-9023ff8b624c',
      recurringTransaction: {
        id: '1a32733c-345d-445c-b7c8-9023ff8b624c',
        accountId: '5c23e01c-5969-435e-b296-deba61630ef5',
        description: 'Visa Payment',
        amount: -10000,
        categoryId: '00000010-0000-0000-0000-000000000001',
        frequency: 'MONTH',
        interval: 1,
        startOn: '2026-02-09',
        endOn: null,
        createdAt: '2026-01-19T21:41:03.807Z',
        updatedAt: '2026-01-19T21:41:03.807Z',
        occurrences: null,
        recurringTransactionState: 'ACTIVE',
      },
      balance: 215549,
      createdAt: '2026-01-26T01:53:20.891Z',
      updatedAt: null,
    };

    const rawData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      accounts: [validCheckingAccount],
      transactions: [transactionWithInvalidField],
      categories: [validParentCategory],
      statements: [],
      recurringTransactions: [
        buildRecurringTransaction(
          validCheckingAccount.id,
          validParentCategory.id,
        ),
      ],
      recurringTransactionEvents: [
        buildRecurringEvent(
          '00000000-0000-0000-0000-000000000211',
          yesterday,
          transactionWithInvalidField.id,
        ),
        buildRecurringEvent(
          '00000000-0000-0000-0000-000000000212',
          tomorrow,
          transactionWithInvalidField.id,
        ),
      ],
      transactionSplits: [],
    };

    const result = processLoadedData(rawData, {
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.removedRecords).toBe(1);
    expect(result.data.recurringTransactionEvents).toHaveLength(1);
    expect(result.data.recurringTransactionEvents[0].expectedDate).toBe(
      tomorrow,
    );
    expect(result.data.transactions[0].isVirtual).toBeUndefined();
    expect(result.data.transactions[0].recurringTransaction).toBeUndefined();
    expect(result.data.transactions[0].recurringTransactionId).toBeUndefined();
    expect(result.data.transactions[0].balance).toBeUndefined();
  });
});
