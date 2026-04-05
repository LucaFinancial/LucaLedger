import { describe, expect, it } from 'vitest';

import {
  LINK_VALIDATION_REASONS,
  getCounterpartAmountForLinkedPair,
  getSignOrientation,
  inferLinkIsSameSign,
  normalizeRecurringTransactionLinks,
  normalizeTransactionLinks,
  validateRecurringLinkCandidate,
  validateTransactionLinkCandidate,
} from '@/utils/linking';

describe('linking utilities', () => {
  it('preserves opposite-sign orientation when syncing counterpart amounts', () => {
    expect(getSignOrientation(-10000, 10000)).toBe('opposite-sign');
    expect(inferLinkIsSameSign(-10000, 10000)).toBe(false);
    expect(
      getCounterpartAmountForLinkedPair({
        sourceAmount: -12000,
        counterpartAmount: 10000,
        isSameSign: false,
      }),
    ).toBe(12000);
  });

  it('preserves same-sign orientation when syncing counterpart amounts', () => {
    expect(getSignOrientation(-10000, -10000)).toBe('same-sign');
    expect(inferLinkIsSameSign(-10000, -10000)).toBe(true);
    expect(
      getCounterpartAmountForLinkedPair({
        sourceAmount: -12000,
        counterpartAmount: -10000,
        isSameSign: true,
      }),
    ).toBe(-12000);
  });

  it('rejects transaction link candidates with mismatched dates or split-backed transactions', () => {
    expect(
      validateTransactionLinkCandidate({
        sourceTransaction: {
          id: 'tx-1',
          accountId: 'acc-1',
          date: '2026-04-01',
          amount: -5000,
        },
        destinationTransaction: {
          id: 'tx-2',
          accountId: 'acc-2',
          date: '2026-04-02',
          amount: -5000,
        },
      }),
    ).toEqual({
      valid: false,
      reason: LINK_VALIDATION_REASONS.DATE_MISMATCH,
    });

    expect(
      validateTransactionLinkCandidate({
        sourceTransaction: {
          id: 'tx-1',
          accountId: 'acc-1',
          date: '2026-04-01',
          amount: -5000,
        },
        destinationTransaction: {
          id: 'tx-2',
          accountId: 'acc-2',
          date: '2026-04-01',
          amount: -5000,
        },
        sourceHasSplits: true,
      }),
    ).toEqual({
      valid: false,
      reason: LINK_VALIDATION_REASONS.SOURCE_HAS_SPLITS,
    });
  });

  it('rejects recurring link candidates with mismatched schedules', () => {
    expect(
      validateRecurringLinkCandidate({
        sourceRecurringTransaction: {
          id: 'rt-1',
          accountId: 'acc-1',
          amount: -5000,
          startOn: '2026-04-01',
          endOn: null,
          frequency: 'MONTH',
          interval: 1,
        },
        destinationRecurringTransaction: {
          id: 'rt-2',
          accountId: 'acc-2',
          amount: 5000,
          startOn: '2026-04-15',
          endOn: null,
          frequency: 'MONTH',
          interval: 1,
        },
      }),
    ).toEqual({
      valid: false,
      reason: LINK_VALIDATION_REASONS.SCHEDULE_MISMATCH,
    });
  });

  it('normalizes link collections by dropping invalid and conflicting records', () => {
    const normalizedTransactionLinks = normalizeTransactionLinks(
      [
        {
          id: 'link-older',
          sourceTransactionId: 'tx-1',
          destinationTransactionId: 'tx-2',
          isSameSign: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'link-newer',
          sourceTransactionId: 'tx-1',
          destinationTransactionId: 'tx-3',
          isSameSign: true,
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
        {
          id: 'link-other',
          sourceTransactionId: 'tx-2',
          destinationTransactionId: 'tx-4',
          isSameSign: false,
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-01T00:00:00.000Z',
        },
        {
          id: 'link-self',
          sourceTransactionId: 'tx-4',
          destinationTransactionId: 'tx-4',
          isSameSign: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Set(['tx-1', 'tx-2', 'tx-3', 'tx-4']),
    );

    expect(normalizedTransactionLinks.map((link) => link.id)).toEqual([
      'link-other',
      'link-newer',
    ]);

    const normalizedRecurringLinks = normalizeRecurringTransactionLinks(
      [
        {
          id: 'rec-link',
          sourceRecurringTransactionId: 'rt-1',
          destinationRecurringTransactionId: 'rt-2',
          isSameSign: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Set(['rt-1', 'rt-2']),
    );

    expect(normalizedRecurringLinks).toHaveLength(1);
  });

  it('infers isSameSign for legacy links when linked amounts are available', () => {
    const normalizedTransactionLinks = normalizeTransactionLinks(
      [
        {
          id: 'legacy-link',
          sourceTransactionId: 'tx-1',
          destinationTransactionId: 'tx-2',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Set(['tx-1', 'tx-2']),
      new Map([
        ['tx-1', { id: 'tx-1', amount: -2500 }],
        ['tx-2', { id: 'tx-2', amount: 2500 }],
      ]),
    );

    expect(normalizedTransactionLinks).toEqual([
      expect.objectContaining({
        id: 'legacy-link',
        isSameSign: false,
      }),
    ]);
  });
});
