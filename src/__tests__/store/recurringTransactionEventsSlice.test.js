import { describe, it, expect } from 'vitest';
import recurringTransactionEventsReducer, {
  pruneOldEvents,
} from '@/store/recurringTransactionEvents/slice';

const buildEvent = (id, expectedDate) => ({
  id,
  recurringTransactionId: '00000000-0000-0000-0000-000000000111',
  expectedDate,
  eventState: 'SCHEDULED',
  transactionId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
});

describe('Recurring Transaction Events Slice', () => {
  describe('pruneOldEvents', () => {
    it('removes canonical and slash-format dates older than cutoff', () => {
      const state = [
        buildEvent('1', '2024-01-01'),
        buildEvent('2', '2024/01/01'),
        buildEvent('3', '2024-01-03'),
      ];

      const nextState = recurringTransactionEventsReducer(
        state,
        pruneOldEvents('2024-01-02'),
      );

      expect(nextState).toHaveLength(1);
      expect(nextState[0].id).toBe('3');
    });

    it('keeps events with invalid expectedDate values', () => {
      const state = [
        buildEvent('1', '2024/01/32'),
        buildEvent('2', 'not-a-date'),
        buildEvent('3', '2024-01-01'),
      ];

      const nextState = recurringTransactionEventsReducer(
        state,
        pruneOldEvents('2024-01-02'),
      );

      expect(nextState).toHaveLength(2);
      expect(nextState.map((event) => event.id)).toEqual(['1', '2']);
    });
  });
});
