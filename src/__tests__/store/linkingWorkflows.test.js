import { describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '@/store/rootReducer';
import { actions as recurringTransactionActions } from '@/store/recurringTransactions';
import { actions as recurringTransactionEventActions } from '@/store/recurringTransactionEvents';
import { actions as recurringTransactionLinkActions } from '@/store/recurringTransactionLinks';
import { actions as transactionLinkActions } from '@/store/transactionLinks';
import { actions as transactionActions } from '@/store/transactions';

const IDS = {
  checkingAccount: '11111111-1111-1111-1111-111111111111',
  cardAccount: '22222222-2222-2222-2222-222222222222',
  checkingTransaction: '33333333-3333-3333-3333-333333333333',
  cardTransaction: '44444444-4444-4444-4444-444444444444',
  checkingRecurring: '55555555-5555-5555-5555-555555555555',
  cardRecurring: '66666666-6666-6666-6666-666666666666',
  recurringLink: '77777777-7777-7777-7777-777777777777',
  transactionLink: '88888888-8888-8888-8888-888888888888',
};

const createStore = () =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
      accounts: {
        data: [
          {
            id: IDS.checkingAccount,
            name: 'Checking',
            type: 'CHECKING',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: IDS.cardAccount,
            name: 'Card',
            type: 'CREDIT_CARD',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        loading: false,
        error: null,
        loadingAccountIds: [],
      },
      transactions: [
        {
          id: IDS.checkingTransaction,
          accountId: IDS.checkingAccount,
          amount: -5000,
          date: '2026-04-01',
          description: 'Payment out',
          categoryId: null,
          transactionState: 'COMPLETED',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
        {
          id: IDS.cardTransaction,
          accountId: IDS.cardAccount,
          amount: 5000,
          date: '2026-04-01',
          description: 'Payment in',
          categoryId: null,
          transactionState: 'COMPLETED',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
      ],
      categories: [],
      statements: [],
      recurringTransactions: [
        {
          id: IDS.checkingRecurring,
          accountId: IDS.checkingAccount,
          amount: -5000,
          description: 'Recurring payment out',
          categoryId: null,
          frequency: 'MONTH',
          interval: 1,
          startOn: '2026-04-15',
          endOn: null,
          recurringTransactionState: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
        {
          id: IDS.cardRecurring,
          accountId: IDS.cardAccount,
          amount: 5000,
          description: 'Recurring payment in',
          categoryId: null,
          frequency: 'MONTH',
          interval: 1,
          startOn: '2026-04-15',
          endOn: null,
          recurringTransactionState: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
      ],
      recurringTransactionEvents: [],
      recurringTransactionLinks: [
        {
          id: IDS.recurringLink,
          sourceRecurringTransactionId: IDS.checkingRecurring,
          destinationRecurringTransactionId: IDS.cardRecurring,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
      ],
      transactionSplits: [],
      transactionLinks: [
        {
          id: IDS.transactionLink,
          sourceTransactionId: IDS.checkingTransaction,
          destinationTransactionId: IDS.cardTransaction,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
      ],
      settings: {},
      encryption: { status: 'uninitialized', authStatus: 'unauthenticated' },
    },
  });

describe('linking workflows', () => {
  it('syncs linked transaction amounts while preserving opposite signs', async () => {
    const store = createStore();
    const sourceTransaction = store
      .getState()
      .transactions.find(
        (transaction) => transaction.id === IDS.checkingTransaction,
      );

    await store.dispatch(
      transactionActions.updateTransactionProperty(
        IDS.checkingAccount,
        sourceTransaction,
        'amount',
        -7500,
      ),
    );

    const nextState = store.getState();
    expect(
      nextState.transactions.find(
        (transaction) => transaction.id === IDS.checkingTransaction,
      ).amount,
    ).toBe(-7500);
    expect(
      nextState.transactions.find(
        (transaction) => transaction.id === IDS.cardTransaction,
      ).amount,
    ).toBe(7500);
  });

  it('reconciles selected transactions before linking them', async () => {
    const store = createStore();

    await store.dispatch(
      transactionLinkActions.unlinkTransactionByTransactionId(
        IDS.checkingTransaction,
      ),
    );

    store.dispatch(
      transactionActions.updateMultipleTransactionsFields(
        [IDS.checkingTransaction],
        {
          date: '2026-04-03',
          amount: -6200,
          description: 'Checking side',
        },
      ),
    );
    store.dispatch(
      transactionActions.updateMultipleTransactionsFields(
        [IDS.cardTransaction],
        {
          date: '2026-04-05',
          amount: 7400,
          description: 'Card side',
        },
      ),
    );

    const result = await store.dispatch(
      transactionLinkActions.reconcileAndSaveTransactionLinkPair({
        sourceTransactionId: IDS.checkingTransaction,
        destinationTransactionId: IDS.cardTransaction,
        reconciledDate: '2026-04-05',
        reconciledAbsoluteAmount: 7400,
        reconciledDescription: 'Matched transfer',
      }),
    );

    expect(result.valid).toBe(true);

    const nextState = store.getState();
    expect(
      nextState.transactions.find(
        (transaction) => transaction.id === IDS.checkingTransaction,
      ),
    ).toMatchObject({
      date: '2026-04-05',
      amount: -7400,
      description: 'Matched transfer',
    });
    expect(
      nextState.transactions.find(
        (transaction) => transaction.id === IDS.cardTransaction,
      ),
    ).toMatchObject({
      date: '2026-04-05',
      amount: 7400,
      description: 'Matched transfer',
    });
    expect(nextState.transactionLinks).toHaveLength(1);
  });

  it('removes only the link when a linked transaction is deleted', async () => {
    const store = createStore();
    const sourceTransaction = store
      .getState()
      .transactions.find(
        (transaction) => transaction.id === IDS.checkingTransaction,
      );

    await store.dispatch(
      transactionActions.removeTransactionById(
        IDS.checkingAccount,
        sourceTransaction,
      ),
    );

    expect(store.getState().transactions.map((transaction) => transaction.id)).toEqual(
      [IDS.cardTransaction],
    );
    expect(store.getState().transactionLinks).toEqual([]);
  });

  it('syncs recurring rule schedule fields and amount while keeping description independent', async () => {
    const store = createStore();

    await store.dispatch(
      recurringTransactionActions.updateRecurringTransactionProperty(
        IDS.checkingRecurring,
        {
          amount: -9000,
          startOn: '2026-05-01',
          frequency: 'WEEK',
          interval: 2,
          endOn: '2026-09-01',
          recurringTransactionState: 'PAUSED',
          description: 'Changed on checking only',
        },
      ),
    );

    const nextState = store.getState();
    const checkingRule = nextState.recurringTransactions.find(
      (transaction) => transaction.id === IDS.checkingRecurring,
    );
    const cardRule = nextState.recurringTransactions.find(
      (transaction) => transaction.id === IDS.cardRecurring,
    );

    expect(checkingRule.description).toBe('Changed on checking only');
    expect(cardRule.description).toBe('Recurring payment in');
    expect(cardRule.amount).toBe(9000);
    expect(cardRule.startOn).toBe('2026-05-01');
    expect(cardRule.frequency).toBe('WEEK');
    expect(cardRule.interval).toBe(2);
    expect(cardRule.endOn).toBe('2026-09-01');
    expect(cardRule.recurringTransactionState).toBe('PAUSED');
  });

  it('reconciles recurring transactions before linking them', async () => {
    const store = createStore();

    await store.dispatch(
      recurringTransactionLinkActions.unlinkRecurringTransactionByRecurringTransactionId(
        IDS.checkingRecurring,
      ),
    );

    await store.dispatch(
      recurringTransactionActions.updateRecurringTransactionProperty(
        IDS.checkingRecurring,
        {
          amount: -6100,
          startOn: '2026-04-12',
          frequency: 'MONTH',
          interval: 1,
          endOn: null,
          description: 'Checking recurring',
        },
      ),
    );
    await store.dispatch(
      recurringTransactionActions.updateRecurringTransactionProperty(
        IDS.cardRecurring,
        {
          amount: 7500,
          startOn: '2026-04-15',
          frequency: 'WEEK',
          interval: 2,
          endOn: '2026-12-31',
          description: 'Card recurring',
        },
      ),
    );

    const result = await store.dispatch(
      recurringTransactionLinkActions.reconcileAndSaveRecurringTransactionLinkPair({
        sourceRecurringTransactionId: IDS.checkingRecurring,
        destinationRecurringTransactionId: IDS.cardRecurring,
        reconciledAbsoluteAmount: 7500,
        reconciledScheduleSource: 'destination',
        reconciledDescription: 'Matched recurring transfer',
      }),
    );

    expect(result.valid).toBe(true);

    const nextState = store.getState();
    expect(
      nextState.recurringTransactions.find(
        (transaction) => transaction.id === IDS.checkingRecurring,
      ),
    ).toMatchObject({
      amount: -7500,
      startOn: '2026-04-15',
      frequency: 'WEEK',
      interval: 2,
      endOn: '2026-12-31',
      description: 'Matched recurring transfer',
    });
    expect(
      nextState.recurringTransactions.find(
        (transaction) => transaction.id === IDS.cardRecurring,
      ),
    ).toMatchObject({
      amount: 7500,
      startOn: '2026-04-15',
      frequency: 'WEEK',
      interval: 2,
      endOn: '2026-12-31',
      description: 'Matched recurring transfer',
    });
    expect(nextState.recurringTransactionLinks).toHaveLength(1);
  });

  it('realizes both sides of a linked recurring pair and auto-links the transactions', async () => {
    const store = createStore();
    const recurringTransaction = store
      .getState()
      .recurringTransactions.find(
        (transaction) => transaction.id === IDS.checkingRecurring,
      );

    await store.dispatch(
      recurringTransactionEventActions.realizeRecurringTransaction(
        recurringTransaction,
        '2026-04-15',
      ),
    );

    const nextState = store.getState();
    const realizedTransactions = nextState.transactions.filter(
      (transaction) =>
        transaction.description === 'Recurring payment out' ||
        transaction.description === 'Recurring payment in',
    );

    expect(realizedTransactions).toHaveLength(2);
    expect(
      realizedTransactions.every(
        (transaction) => transaction.transactionState === 'PLANNED',
      ),
    ).toBe(true);
    expect(nextState.recurringTransactionEvents).toHaveLength(2);
    expect(nextState.transactionLinks).toHaveLength(2);
    expect(
      nextState.transactionLinks.some(
        (link) =>
          realizedTransactions.some(
            (transaction) => transaction.id === link.sourceTransactionId,
          ) &&
          realizedTransactions.some(
            (transaction) => transaction.id === link.destinationTransactionId,
          ),
      ),
    ).toBe(true);
  });
});
