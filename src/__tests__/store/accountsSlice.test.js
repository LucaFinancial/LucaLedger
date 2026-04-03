/**
 * Tests for Accounts Redux Slice
 * Tests account state management actions and reducers
 */

import { describe, it, expect } from 'vitest';
import accountsReducer, {
  setAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  setLoading,
  setError,
  addLoadingAccountId,
  removeLoadingAccountId,
  clearLoadingAccountIds,
} from '@/store/accounts/slice';
import { AccountType } from '@/store/accounts/constants';
import {
  validCheckingAccount,
  validSavingsAccount,
  accountWithExtraProperties,
} from '../fixtures';

describe('Accounts Slice', () => {
  const initialState = {
    data: [],
    loading: false,
    error: null,
    loadingAccountIds: [],
  };

  describe('reducers', () => {
    describe('setAccounts', () => {
      it('should replace all accounts', () => {
        const accounts = [validCheckingAccount, validSavingsAccount];
        const state = accountsReducer(initialState, setAccounts(accounts));

        expect(state.data).toHaveLength(2);
        expect(state.data[0].id).toBe(validCheckingAccount.id);
        expect(state.data[1].id).toBe(validSavingsAccount.id);
      });

      it('should clean accounts by removing extra properties', () => {
        const state = accountsReducer(
          initialState,
          setAccounts([accountWithExtraProperties]),
        );

        expect(state.data[0].extraField).toBeUndefined();
        expect(state.data[0].anotherExtra).toBeUndefined();
        expect(state.data[0].id).toBe(accountWithExtraProperties.id);
      });

      it('should replace existing accounts', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount],
        };
        const state = accountsReducer(
          stateWithData,
          setAccounts([validSavingsAccount]),
        );

        expect(state.data).toHaveLength(1);
        expect(state.data[0].id).toBe(validSavingsAccount.id);
      });
    });

    describe('addAccount', () => {
      it('should add a new account', () => {
        const state = accountsReducer(
          initialState,
          addAccount(validCheckingAccount),
        );

        expect(state.data).toHaveLength(1);
        expect(state.data[0]).toEqual(validCheckingAccount);
      });

      it('should append to existing accounts', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount],
        };
        const state = accountsReducer(
          stateWithData,
          addAccount(validSavingsAccount),
        );

        expect(state.data).toHaveLength(2);
      });

      it('should clean account on add', () => {
        const state = accountsReducer(
          initialState,
          addAccount(accountWithExtraProperties),
        );

        expect(state.data[0].extraField).toBeUndefined();
      });
    });

    describe('updateAccount', () => {
      it('should update existing account', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount],
        };
        const updatedAccount = {
          ...validCheckingAccount,
          name: 'Updated Name',
        };
        const state = accountsReducer(
          stateWithData,
          updateAccount(updatedAccount),
        );

        expect(state.data[0].name).toBe('Updated Name');
      });

      it('should not modify other accounts', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount, validSavingsAccount],
        };
        const updatedAccount = {
          ...validCheckingAccount,
          name: 'Updated Checking',
        };
        const state = accountsReducer(
          stateWithData,
          updateAccount(updatedAccount),
        );

        expect(state.data[1].name).toBe(validSavingsAccount.name);
      });

      it('should do nothing if account not found', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount],
        };
        const nonExistentAccount = {
          id: 'non-existent',
          name: 'Non Existent',
          type: AccountType.CHECKING,
        };
        const state = accountsReducer(
          stateWithData,
          updateAccount(nonExistentAccount),
        );

        expect(state.data).toHaveLength(1);
        expect(state.data[0].id).toBe(validCheckingAccount.id);
      });
    });

    describe('removeAccount', () => {
      it('should remove account by id', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount, validSavingsAccount],
        };
        const state = accountsReducer(
          stateWithData,
          removeAccount(validCheckingAccount.id),
        );

        expect(state.data).toHaveLength(1);
        expect(state.data[0].id).toBe(validSavingsAccount.id);
      });

      it('should do nothing if account not found', () => {
        const stateWithData = {
          ...initialState,
          data: [validCheckingAccount],
        };
        const state = accountsReducer(
          stateWithData,
          removeAccount('non-existent'),
        );

        expect(state.data).toHaveLength(1);
      });
    });

    describe('setLoading', () => {
      it('should set loading to true', () => {
        const state = accountsReducer(initialState, setLoading(true));
        expect(state.loading).toBe(true);
      });

      it('should set loading to false', () => {
        const loadingState = { ...initialState, loading: true };
        const state = accountsReducer(loadingState, setLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error message', () => {
        const state = accountsReducer(initialState, setError('Test error'));
        expect(state.error).toBe('Test error');
      });

      it('should clear error with null', () => {
        const errorState = { ...initialState, error: 'Existing error' };
        const state = accountsReducer(errorState, setError(null));
        expect(state.error).toBeNull();
      });
    });

    describe('loadingAccountIds', () => {
      it('should add loading account id', () => {
        const state = accountsReducer(
          initialState,
          addLoadingAccountId('acc-001'),
        );
        expect(state.loadingAccountIds).toContain('acc-001');
      });

      it('should not add duplicate loading account id', () => {
        const stateWithId = {
          ...initialState,
          loadingAccountIds: ['acc-001'],
        };
        const state = accountsReducer(
          stateWithId,
          addLoadingAccountId('acc-001'),
        );
        expect(state.loadingAccountIds).toHaveLength(1);
      });

      it('should remove loading account id', () => {
        const stateWithId = {
          ...initialState,
          loadingAccountIds: ['acc-001', 'acc-002'],
        };
        const state = accountsReducer(
          stateWithId,
          removeLoadingAccountId('acc-001'),
        );
        expect(state.loadingAccountIds).not.toContain('acc-001');
        expect(state.loadingAccountIds).toContain('acc-002');
      });

      it('should clear all loading account ids', () => {
        const stateWithIds = {
          ...initialState,
          loadingAccountIds: ['acc-001', 'acc-002', 'acc-003'],
        };
        const state = accountsReducer(stateWithIds, clearLoadingAccountIds());
        expect(state.loadingAccountIds).toHaveLength(0);
      });
    });
  });
});
