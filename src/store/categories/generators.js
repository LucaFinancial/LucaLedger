import { v4 as uuid } from 'uuid';

import schemas from './schemas';

export const generateCategory = (initialData = {}) => {
  const category = {
    id: uuid(),
    name: '',
    subCategories: [],
    ...initialData,
  };
  schemas.primaryCategorySchema.validateSync(category);
  return category;
};
