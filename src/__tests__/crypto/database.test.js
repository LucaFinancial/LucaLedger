import { beforeEach, describe, expect, it } from 'vitest';

import { generateDataEncryptionKey } from '@/crypto/encryption';
import {
  db,
  deleteEncryptedRecord,
  getUserEncryptedRecords,
  storeUserEncryptedRecord,
} from '@/crypto/database';

describe('Encrypted database user isolation', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('stores duplicate record ids for different users without conflict', async () => {
    const userOneDek = await generateDataEncryptionKey();
    const userTwoDek = await generateDataEncryptionKey();

    await storeUserEncryptedRecord(
      'transactions',
      'shared-id',
      { id: 'shared-id', amount: 100 },
      userOneDek,
      'user-1',
    );

    await storeUserEncryptedRecord(
      'transactions',
      'shared-id',
      { id: 'shared-id', amount: 200 },
      userTwoDek,
      'user-2',
    );

    const userOneRecords = await getUserEncryptedRecords(
      'transactions',
      userOneDek,
      'user-1',
    );
    const userTwoRecords = await getUserEncryptedRecords(
      'transactions',
      userTwoDek,
      'user-2',
    );

    expect(userOneRecords).toEqual([{ id: 'shared-id', amount: 100 }]);
    expect(userTwoRecords).toEqual([{ id: 'shared-id', amount: 200 }]);
  });

  it('deletes only the current user record when ids match', async () => {
    const userOneDek = await generateDataEncryptionKey();
    const userTwoDek = await generateDataEncryptionKey();

    await storeUserEncryptedRecord(
      'transactions',
      'shared-id',
      { id: 'shared-id', amount: 100 },
      userOneDek,
      'user-1',
    );

    await storeUserEncryptedRecord(
      'transactions',
      'shared-id',
      { id: 'shared-id', amount: 200 },
      userTwoDek,
      'user-2',
    );

    await deleteEncryptedRecord('transactions', 'shared-id', 'user-1');

    const userOneRecords = await getUserEncryptedRecords(
      'transactions',
      userOneDek,
      'user-1',
    );
    const userTwoRecords = await getUserEncryptedRecords(
      'transactions',
      userTwoDek,
      'user-2',
    );

    expect(userOneRecords).toEqual([]);
    expect(userTwoRecords).toEqual([{ id: 'shared-id', amount: 200 }]);
  });

  it('enforces unique usernames at the database level', async () => {
    await db.users.add({ id: 'user-1', username: 'alex' });

    await expect(
      db.users.add({ id: 'user-2', username: 'alex' }),
    ).rejects.toThrow();
  });
});
