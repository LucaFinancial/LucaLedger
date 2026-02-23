import { beforeEach, describe, expect, it } from 'vitest';

import {
  db,
  deleteUser,
  getUserSchemaVersion,
  setUserSchemaVersion,
} from '@/crypto/database';

describe('Encrypted database schema version metadata', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('stores and retrieves schema version per user', async () => {
    await setUserSchemaVersion('user-1', '3.0.2');
    await setUserSchemaVersion('user-2', '3.0.1');

    await expect(getUserSchemaVersion('user-1')).resolves.toBe('3.0.2');
    await expect(getUserSchemaVersion('user-2')).resolves.toBe('3.0.1');
  });

  it('removes schema version metadata when deleting a user', async () => {
    await db.users.add({ id: 'user-1', username: 'alex' });
    await setUserSchemaVersion('user-1', '3.0.2');

    await deleteUser('user-1');

    await expect(getUserSchemaVersion('user-1')).resolves.toBeNull();
  });
});
