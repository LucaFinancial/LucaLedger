/**
 * Tests for Transactions Redux Slice
 * Tests transaction state management actions and reducers
 */

import { describe, it, expect } from 'vitest';
import transactionsReducer, {
  setTransactions,
  addTransaction,
  updateTransaction,
  updateMultipleTransactions,
  removeTransaction,
} from '@/store/transactions/slice';
import { TransactionStateEnum } from '@/store/transactions/constants';
import {
  validCompletedTransaction,
  validPendingTransaction,
  validScheduledTransaction,
  transactionWithExtraProperties,
  transactionLegacyStatusSpaces,
} from '../fixtures';

describe('Transactions Slice', () => {
  const initialState = [];

  describe('reducers', () => {
    describe('setTransactions', () => {
      it('should replace all transactions', () => {
        const transactions = [
          validCompletedTransaction,
          validPendingTransaction,
        ];
        const state = transactionsReducer(
          initialState,
          setTransactions(transactions)
        );

        expect(state).toHaveLength(2);
        expect(state[0].id).toBe(validCompletedTransaction.id);
        expect(state[1].id).toBe(validPendingTransaction.id);
      });

      it('should clean transactions by removing extra properties', () => {
        const state = transactionsReducer(
          initialState,
          setTransactions([transactionWithExtraProperties])
        );

        expect(state[0].extraField).toBeUndefined();
        expect(state[0].anotherExtra).toBeUndefined();
        expect(state[0].id).toBe(transactionWithExtraProperties.id);
      });

      it('should sanitize legacy status with trailing spaces', () => {
        const state = transactionsReducer(
          initialState,
          setTransactions([transactionLegacyStatusSpaces])
        );

        expect(state[0].status).toBe('complete');
      });

      it('should replace existing transactions', () => {
        const stateWithData = [validCompletedTransaction];
        const state = transactionsReducer(
          stateWithData,
          setTransactions([validPendingTransaction])
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validPendingTransaction.id);
      });
    });

    describe('addTransaction', () => {
      it('should add a new transaction', () => {
        const state = transactionsReducer(
          initialState,
          addTransaction(validCompletedTransaction)
        );

        expect(state).toHaveLength(1);
        expect(state[0]).toEqual(validCompletedTransaction);
      });

      it('should append to existing transactions', () => {
        const stateWithData = [validCompletedTransaction];
        const state = transactionsReducer(
          stateWithData,
          addTransaction(validPendingTransaction)
        );

        expect(state).toHaveLength(2);
      });

      it('should clean transaction on add', () => {
        const state = transactionsReducer(
          initialState,
          addTransaction(transactionWithExtraProperties)
        );

        expect(state[0].extraField).toBeUndefined();
      });
    });

    describe('updateTransaction', () => {
      it('should update existing transaction', () => {
        const stateWithData = [validCompletedTransaction];
        const updatedTransaction = {
          ...validCompletedTransaction,
          description: 'Updated Description',
        };
        const state = transactionsReducer(
          stateWithData,
          updateTransaction(updatedTransaction)
        );

        expect(state[0].description).toBe('Updated Description');
      });

      it('should preserve other fields when updating', () => {
        const stateWithData = [validCompletedTransaction];
        const updatedTransaction = {
          ...validCompletedTransaction,
          amount: 10000,
        };
        const state = transactionsReducer(
          stateWithData,
          updateTransaction(updatedTransaction)
        );

        expect(state[0].description).toBe(
          validCompletedTransaction.description
        );
        expect(state[0].amount).toBe(10000);
      });

      it('should not modify other transactions', () => {
        const stateWithData = [
          validCompletedTransaction,
          validPendingTransaction,
        ];
        const updatedTransaction = {
          ...validCompletedTransaction,
          description: 'Updated',
        };
        const state = transactionsReducer(
          stateWithData,
          updateTransaction(updatedTransaction)
        );

        expect(state[1].description).toBe(validPendingTransaction.description);
      });

      it('should do nothing if transaction not found', () => {
        const stateWithData = [validCompletedTransaction];
        const nonExistentTransaction = {
          id: 'non-existent',
          accountId: 'acc-001',
          status: TransactionStateEnum.COMPLETED,
          date: '2024/01/01',
          amount: 0,
          description: 'Non Existent',
        };
        const state = transactionsReducer(
          stateWithData,
          updateTransaction(nonExistentTransaction)
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validCompletedTransaction.id);
      });
    });

    describe('updateMultipleTransactions', () => {
      it('should update multiple transactions at once', () => {
        const stateWithData = [
          validCompletedTransaction,
          validPendingTransaction,
          validScheduledTransaction,
        ];
        const state = transactionsReducer(
          stateWithData,
          updateMultipleTransactions({
            transactionIds: [
              validCompletedTransaction.id,
              validPendingTransaction.id,
            ],
            updates: { status: TransactionStateEnum.COMPLETED },
          })
        );

        expect(state[0].status).toBe(TransactionStateEnum.COMPLETED);
        expect(state[1].status).toBe(TransactionStateEnum.COMPLETED);
        expect(state[2].status).toBe(TransactionStateEnum.SCHEDULED);
      });

      it('should preserve non-updated fields', () => {
        const stateWithData = [validCompletedTransaction];
        const state = transactionsReducer(
          stateWithData,
          updateMultipleTransactions({
            transactionIds: [validCompletedTransaction.id],
            updates: { amount: 99999 },
          })
        );

        expect(state[0].amount).toBe(99999);
        expect(state[0].description).toBe(
          validCompletedTransaction.description
        );
      });

      it('should handle empty transaction IDs array', () => {
        const stateWithData = [validCompletedTransaction];
        const state = transactionsReducer(
          stateWithData,
          updateMultipleTransactions({
            transactionIds: [],
            updates: { amount: 99999 },
          })
        );

        expect(state[0].amount).toBe(validCompletedTransaction.amount);
      });
    });

    describe('removeTransaction', () => {
      it('should remove transaction by id', () => {
        const stateWithData = [
          validCompletedTransaction,
          validPendingTransaction,
        ];
        const state = transactionsReducer(
          stateWithData,
          removeTransaction(validCompletedTransaction.id)
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validPendingTransaction.id);
      });

      it('should do nothing if transaction not found', () => {
        const stateWithData = [validCompletedTransaction];
        const state = transactionsReducer(
          stateWithData,
          removeTransaction('non-existent')
        );

        expect(state).toHaveLength(1);
      });

      it('should return empty array when removing last transaction', () => {
        const stateWithData = [validCompletedTransaction];
        const state = transactionsReducer(
          stateWithData,
          removeTransaction(validCompletedTransaction.id)
        );

        expect(state).toHaveLength(0);
      });
    });
  });
});
