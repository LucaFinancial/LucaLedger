import { describe, expect, it } from 'vitest';
import { validateCollection } from '@luca-financial/luca-schema';

import { getDefaultCategories } from '@/utils/defaultCategories';

describe('default categories', () => {
  it('normalizes seed categories to the current schema', () => {
    const timestamp = '2024-01-01T00:00:00.000Z';
    const categories = getDefaultCategories(timestamp);
    const validation = validateCollection('category', categories);

    expect(validation.valid).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toMatchObject({
      createdAt: timestamp,
      updatedAt: null,
    });
  });
});
