/**
 * Tests for Statements Redux Slice
 * Tests statement state management actions and reducers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import statementsReducer, {
  setStatements,
  addStatement,
  updateStatement,
  removeStatement,
  lockStatement,
  unlockStatement,
} from '@/store/statements/slice';
import { StatementStatusEnum } from '@/store/statements/constants';
import {
  validCurrentStatement,
  validPastStatement,
  validLockedStatement,
  validDraftStatement,
  legacyStatementWithTotal,
} from '../fixtures';

describe('Statements Slice', () => {
  const initialState = [];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('reducers', () => {
    describe('setStatements', () => {
      it('should replace all statements', () => {
        const statements = [validCurrentStatement, validPastStatement];
        const state = statementsReducer(
          initialState,
          setStatements(statements),
        );

        expect(state).toHaveLength(2);
        expect(state[0].id).toBe(validCurrentStatement.id);
        expect(state[1].id).toBe(validPastStatement.id);
      });

      it('should clean statements and normalize dates', () => {
        const state = statementsReducer(
          initialState,
          setStatements([legacyStatementWithTotal]),
        );

        expect(state[0].endDate).toBeDefined();
        expect(state[0].statementPeriod).toBeUndefined();
      });

      it('should handle legacy statement with total field', () => {
        const state = statementsReducer(
          initialState,
          setStatements([legacyStatementWithTotal]),
        );

        expect(state[0].endingBalance).toBe(15000);
      });

      it('should replace existing statements', () => {
        const stateWithData = [validCurrentStatement];
        const state = statementsReducer(
          stateWithData,
          setStatements([validPastStatement]),
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validPastStatement.id);
      });
    });

    describe('addStatement', () => {
      it('should add a new statement', () => {
        const state = statementsReducer(
          initialState,
          addStatement(validCurrentStatement),
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validCurrentStatement.id);
      });

      it('should append to existing statements', () => {
        const stateWithData = [validCurrentStatement];
        const state = statementsReducer(
          stateWithData,
          addStatement(validPastStatement),
        );

        expect(state).toHaveLength(2);
      });

      it('should prevent duplicate statements for same account and period', () => {
        const stateWithData = [validCurrentStatement];
        const duplicateStatement = {
          ...validCurrentStatement,
          id: 'different-id',
        };
        const state = statementsReducer(
          stateWithData,
          addStatement(duplicateStatement),
        );

        // Should not add duplicate
        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validCurrentStatement.id);
      });

      it('should allow statements for different accounts', () => {
        const stateWithData = [validCurrentStatement];
        const differentAccountStatement = {
          ...validCurrentStatement,
          id: 'different-id',
          accountId: 'different-account',
        };
        const state = statementsReducer(
          stateWithData,
          addStatement(differentAccountStatement),
        );

        expect(state).toHaveLength(2);
      });

      it('should allow statements for different periods', () => {
        const stateWithData = [validCurrentStatement];
        const differentPeriodStatement = {
          ...validDraftStatement, // Has different period
        };
        const state = statementsReducer(
          stateWithData,
          addStatement(differentPeriodStatement),
        );

        expect(state).toHaveLength(2);
      });
    });

    describe('updateStatement', () => {
      it('should update existing statement', () => {
        const stateWithData = [validCurrentStatement];
        const updatedStatement = {
          ...validCurrentStatement,
          endingBalance: 50000,
        };
        const state = statementsReducer(
          stateWithData,
          updateStatement(updatedStatement),
        );

        expect(state[0].endingBalance).toBe(50000);
      });

      it('should update updatedAt timestamp', () => {
        const stateWithData = [validCurrentStatement];
        const updatedStatement = {
          ...validCurrentStatement,
          endingBalance: 50000,
        };
        const state = statementsReducer(
          stateWithData,
          updateStatement(updatedStatement),
        );

        expect(state[0].updatedAt).toBe('2024-06-15T12:00:00.000Z');
      });

      it('should not modify other statements', () => {
        const stateWithData = [validCurrentStatement, validPastStatement];
        const updatedStatement = {
          ...validCurrentStatement,
          endingBalance: 50000,
        };
        const state = statementsReducer(
          stateWithData,
          updateStatement(updatedStatement),
        );

        expect(state[1].endingBalance).toBe(validPastStatement.endingBalance);
      });

      it('should do nothing if statement not found', () => {
        const stateWithData = [validCurrentStatement];
        const nonExistentStatement = {
          ...validCurrentStatement,
          id: 'non-existent',
        };
        const state = statementsReducer(
          stateWithData,
          updateStatement(nonExistentStatement),
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validCurrentStatement.id);
      });
    });

    describe('removeStatement', () => {
      it('should remove statement by id', () => {
        const stateWithData = [validCurrentStatement, validPastStatement];
        const state = statementsReducer(
          stateWithData,
          removeStatement(validCurrentStatement.id),
        );

        expect(state).toHaveLength(1);
        expect(state[0].id).toBe(validPastStatement.id);
      });

      it('should do nothing if statement not found', () => {
        const stateWithData = [validCurrentStatement];
        const state = statementsReducer(
          stateWithData,
          removeStatement('non-existent'),
        );

        expect(state).toHaveLength(1);
      });
    });

    describe('lockStatement', () => {
      it('should set status to locked', () => {
        const stateWithData = [validPastStatement];
        const state = statementsReducer(
          stateWithData,
          lockStatement(validPastStatement.id),
        );

        expect(state[0].status).toBe(StatementStatusEnum.LOCKED);
      });

      it('should update updatedAt timestamp', () => {
        const stateWithData = [validPastStatement];
        const state = statementsReducer(
          stateWithData,
          lockStatement(validPastStatement.id),
        );

        expect(state[0].updatedAt).toBe('2024-06-15T12:00:00.000Z');
      });

      it('should do nothing if statement not found', () => {
        const stateWithData = [validCurrentStatement];
        const state = statementsReducer(
          stateWithData,
          lockStatement('non-existent'),
        );

        expect(state[0].status).toBe(validCurrentStatement.status);
      });
    });

    describe('unlockStatement', () => {
      it('should set status to past', () => {
        const stateWithData = [validLockedStatement];
        const state = statementsReducer(
          stateWithData,
          unlockStatement(validLockedStatement.id),
        );

        expect(state[0].status).toBe(StatementStatusEnum.PAST);
      });

      it('should update updatedAt timestamp', () => {
        const stateWithData = [validLockedStatement];
        const state = statementsReducer(
          stateWithData,
          unlockStatement(validLockedStatement.id),
        );

        expect(state[0].updatedAt).toBe('2024-06-15T12:00:00.000Z');
      });

      it('should do nothing if statement not found', () => {
        const stateWithData = [validLockedStatement];
        const state = statementsReducer(
          stateWithData,
          unlockStatement('non-existent'),
        );

        expect(state[0].status).toBe(StatementStatusEnum.LOCKED);
      });
    });
  });
});
