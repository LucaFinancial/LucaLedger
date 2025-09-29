import { Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import CreateNewCategory from '@/components/CreateNewCategory';
import { actions, constants, selectors } from '@/store/categories';
import CategoryRow from './CategoryRow';

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector(selectors.selectCategories);

  const loadDefaultCategories = () => {
    constants.CategoryInitialData.forEach((category) => {
      dispatch(actions.loadCategory(category));
    });
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <Box>Categories</Box>
      <Button onClick={loadDefaultCategories}>Load Default Categories</Button>
      <CreateNewCategory />
      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
        />
      ))}
    </Box>
  );
}
