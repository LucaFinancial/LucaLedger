import categoriesData from '@/config/categories.json';
import { migrateDataToSchema } from '@/utils/dataMigration';

export const getDefaultCategories = (
  timestamp = new Date().toISOString(),
) => {
  const migration = migrateDataToSchema(
    {
      categories: categoriesData.categories,
    },
    {
      timestamp,
    },
  );

  return migration.data.categories;
};

