import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearUserData, createUser, db, deleteUser } from '@/crypto/database';

const USER_A = 'user-a';
const USER_B = 'user-b';

const USER_OWNED_STORES = [
  'accounts',
  'transactions',
  'categories',
  'statements',
  'recurringTransactions',
  'recurringTransactionEvents',
  'transactionSplits',
];

function makeEncryptedRecord(id, userId) {
  return {
    id,
    userId,
    iv: 'AAECAwQFBgcICQoL',
    ciphertext: 'AAECAwQFBgcICQoLDA0ODw==',
  };
}

async function seedUserOwnedRecords(userId, suffix = 'a') {
  await db.accounts.put(makeEncryptedRecord(`acc-${suffix}`, userId));
  await db.transactions.put(makeEncryptedRecord(`txn-${suffix}`, userId));
  await db.categories.put(makeEncryptedRecord(`cat-${suffix}`, userId));
  await db.statements.put(makeEncryptedRecord(`stmt-${suffix}`, userId));
  await db.recurringTransactions.put(makeEncryptedRecord(`rt-${suffix}`, userId));
  await db.recurringTransactionEvents.put(
    makeEncryptedRecord(`rte-${suffix}`, userId),
  );
  await db.transactionSplits.put(makeEncryptedRecord(`split-${suffix}`, userId));
}

async function expectUserStoreCounts(userId, expectedCount) {
  for (const storeName of USER_OWNED_STORES) {
    const count = await db[storeName].where('userId').equals(userId).count();
    expect(count).toBe(expectedCount);
  }
}

describe('database user data deletion', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('deleteUser removes all user-owned records and user row', async () => {
    await createUser(USER_A, 'alice', 'salt-a', 'wrapped-a', 'iv-a', 'sent-a', 'siv-a');
    await createUser(USER_B, 'bob', 'salt-b', 'wrapped-b', 'iv-b', 'sent-b', 'siv-b');

    await seedUserOwnedRecords(USER_A, 'a');
    await seedUserOwnedRecords(USER_B, 'b');

    await deleteUser(USER_A);

    await expectUserStoreCounts(USER_A, 0);
    await expectUserStoreCounts(USER_B, 1);

    expect(await db.users.get(USER_A)).toBeUndefined();
    expect(await db.users.get(USER_B)).toBeDefined();
  });

  it('clearUserData removes all user-owned records but preserves user row', async () => {
    await createUser(USER_A, 'alice', 'salt-a', 'wrapped-a', 'iv-a', 'sent-a', 'siv-a');
    await createUser(USER_B, 'bob', 'salt-b', 'wrapped-b', 'iv-b', 'sent-b', 'siv-b');

    await seedUserOwnedRecords(USER_A, 'a');
    await seedUserOwnedRecords(USER_B, 'b');

    await clearUserData(USER_A);

    await expectUserStoreCounts(USER_A, 0);
    await expectUserStoreCounts(USER_B, 1);

    expect(await db.users.get(USER_A)).toBeDefined();
    expect(await db.users.get(USER_B)).toBeDefined();
  });
});
