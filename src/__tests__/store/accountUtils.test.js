import { describe, expect, it } from 'vitest';

import {
  formatAccountClosedAt,
  isAccountClosed,
} from '@/store/accounts/utils';

describe('account utils', () => {
  it('treats accounts with a closedAt timestamp as closed', () => {
    expect(
      isAccountClosed({ closedAt: '2025-02-14T00:00:00.000Z' }),
    ).toBe(true);
  });

  it('treats accounts without a closedAt timestamp as open', () => {
    expect(isAccountClosed({ closedAt: null })).toBe(false);
    expect(isAccountClosed({})).toBe(false);
  });

  it('formats closedAt dates for UI display', () => {
    expect(formatAccountClosedAt('2025-02-14T12:00:00.000Z')).toBe(
      'Feb 14, 2025',
    );
  });

  it('returns null for missing or invalid closedAt dates', () => {
    expect(formatAccountClosedAt(null)).toBeNull();
    expect(formatAccountClosedAt('not-a-date')).toBeNull();
  });
});
