import { Box } from '@mui/material';
import config from '@/config';
import CategoryTree from './CategoryTree';

export default function Categories() {
  const { categories } = config;

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <CategoryTree categories={categories} />
    </Box>
  );
}
