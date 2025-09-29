import * as Yup from 'yup';

const categorySchema = Yup.object().shape({
  id: Yup.string().required('ID is required'),
  name: Yup.string().required('Name is required'),
});

const primaryCategorySchema = Yup.object().shape({
  id: Yup.string().required('Category ID is required'),
  name: Yup.string().required('Category name is required'),
  subCategories: Yup.array().of(categorySchema),
});

export default { categorySchema, primaryCategorySchema };
