import { describe, it, expect } from 'vitest';
import { addDays, format } from 'date-fns';
import { SCHEMA_VERSION } from '@luca-financial/luca-schema';

import { fixDateFormatIssues, processLoadedData } from '@/utils/dataProcessing';

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
  const buildBaseRawData = (schemaVersion = SCHEMA_VERSION) => ({
    schemaVersion,
    accounts: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Primary Checking',
        type: 'CHECKING',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: null,
      },
    ],
    transactions: [],
    categories: [
      {
        id: '00000000-0000-0000-0000-000000000101',
        slug: 'test-parent',
        name: 'Test Parent Category',
        parentId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: null,
      },
    ],
    statements: [],
    recurringTransactions: [
      buildRecurringTransaction(
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000101',
      ),
    ],
    recurringTransactionEvents: [],
    transactionSplits: [],
  });

  const bumpPatchVersion = (version) => {
    const parts = version.split('.').map((part) => Number.parseInt(part, 10));
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  };

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
      schemaVersion: SCHEMA_VERSION,
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
      schemaVersion: SCHEMA_VERSION,
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

  it('accepts schema version suffixes by parsing core semver only', () => {
    const rawData = buildBaseRawData(`${SCHEMA_VERSION}-rc.1`);

    expect(() =>
      processLoadedData(rawData, {
        schemaVersion: rawData.schemaVersion,
      }),
    ).not.toThrow();
  });

  it('rejects malformed schema version values after normalization', () => {
    const rawData = buildBaseRawData('3.0');

    expect(() =>
      processLoadedData(rawData, {
        schemaVersion: rawData.schemaVersion,
      }),
    ).toThrow('Invalid schema version format: 3.0');
  });

  it('rejects files with newer schema versions than the app supports', () => {
    const newerSchemaVersion = bumpPatchVersion(SCHEMA_VERSION);
    const rawData = buildBaseRawData(newerSchemaVersion);

    expect(() =>
      processLoadedData(rawData, {
        schemaVersion: rawData.schemaVersion,
      }),
    ).toThrow(`Unsupported schema version: ${newerSchemaVersion}`);
  });

  it('prunes past slash-format recurring event dates after normalization', () => {
    const yesterdaySlash = format(addDays(new Date(), -1), 'yyyy/MM/dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const rawData = {
      ...buildBaseRawData(),
      recurringTransactionEvents: [
        buildRecurringEvent(
          '00000000-0000-0000-0000-000000000211',
          yesterdaySlash,
          null,
        ),
        buildRecurringEvent(
          '00000000-0000-0000-0000-000000000212',
          tomorrow,
          null,
        ),
      ],
    };

    const result = processLoadedData(rawData, {
      schemaVersion: rawData.schemaVersion,
    });

    expect(result.removedRecords).toBe(1);
    expect(result.data.recurringTransactionEvents).toHaveLength(1);
    expect(result.data.recurringTransactionEvents[0].expectedDate).toBe(
      tomorrow,
    );
  });

  it('keeps recurring events with invalid dates for validation remediation', () => {
    const rawData = {
      ...buildBaseRawData(),
      recurringTransactionEvents: [
        buildRecurringEvent(
          '00000000-0000-0000-0000-000000000213',
          '2026/02/31',
          null,
        ),
      ],
    };

    const result = processLoadedData(rawData, {
      schemaVersion: rawData.schemaVersion,
    });

    expect(result.removedRecords).toBe(0);
    expect(result.data.recurringTransactionEvents).toHaveLength(1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(
      result.errors.some(
        (error) => error.collection === 'recurringTransactionEvents',
      ),
    ).toBe(true);
  });
});

describe('fixDateFormatIssues', () => {
  const baseData = {
    schemaVersion: SCHEMA_VERSION,
    accounts: [],
    categories: [],
    statements: [
      {
        id: '00000000-0000-0000-0000-000000000301',
        accountId: '00000000-0000-0000-0000-000000000001',
        startDate: '2024/01/01',
        endDate: '2024/01/31',
        startingBalance: 0,
        endingBalance: 0,
        totalCharges: 0,
        totalPayments: 0,
        isLocked: false,
        createdAt: '2024-01-31T00:00:00.000Z',
        updatedAt: null,
      },
      {
        id: '00000000-0000-0000-0000-000000000302',
        accountId: '00000000-0000-0000-0000-000000000001',
        startDate: '2024/02/01',
        endDate: '2024/02/29',
        startingBalance: 0,
        endingBalance: 0,
        totalCharges: 0,
        totalPayments: 0,
        isLocked: false,
        createdAt: '2024-02-29T00:00:00.000Z',
        updatedAt: null,
      },
    ],
    transactions: [],
    recurringTransactions: [],
    recurringTransactionEvents: [],
    transactionSplits: [],
  };

  const fixableErrors = [
    {
      collection: 'statements',
      index: 0,
      metadata: {
        hasFixableDateFormatIssues: true,
        dateFormatIssues: [
          {
            fixable: true,
            instancePath: '/startDate',
            normalizedValue: '2024-01-01',
          },
          {
            fixable: true,
            instancePath: '/endDate',
            normalizedValue: '2024-01-31',
          },
        ],
      },
    },
    {
      collection: 'statements',
      index: 1,
      metadata: {
        hasFixableDateFormatIssues: false,
        dateFormatIssues: [
          {
            fixable: false,
            instancePath: '/startDate',
            normalizedValue: null,
          },
        ],
      },
    },
  ];

  it('fixes only the selected error when errorIndexes are provided', () => {
    const result = fixDateFormatIssues(baseData, fixableErrors, {
      errorIndexes: [0],
    });

    expect(result.changed).toBe(true);
    expect(result.data.statements[0].startDate).toBe('2024-01-01');
    expect(result.data.statements[0].endDate).toBe('2024-01-31');
    expect(result.data.statements[1].startDate).toBe('2024/02/01');
  });

  it('fixes all fixable errors and leaves non-fixable errors unchanged', () => {
    const result = fixDateFormatIssues(baseData, fixableErrors);

    expect(result.changed).toBe(true);
    expect(result.data.statements[0].startDate).toBe('2024-01-01');
    expect(result.data.statements[0].endDate).toBe('2024-01-31');
    expect(result.data.statements[1].startDate).toBe('2024/02/01');
    expect(result.data.statements[1].endDate).toBe('2024/02/29');
  });
});
