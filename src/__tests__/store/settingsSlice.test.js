import { describe, it, expect } from 'vitest';
import reducer, { setRecurringProjection } from '@/store/settings/slice';

describe('Settings Slice', () => {
  const initialState = {
    recurringProjection: { amount: 15, unit: 'months' },
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setRecurringProjection', () => {
    const newProjection = { amount: 2, unit: 'years' };
    const nextState = reducer(
      initialState,
      setRecurringProjection(newProjection),
    );
    expect(nextState.recurringProjection).toEqual(newProjection);
  });
});
