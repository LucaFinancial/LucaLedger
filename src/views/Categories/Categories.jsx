import { Box, Paper, Typography } from '@mui/material';
import config from '@/config';
import CategoryTree from './CategoryTree';

export default function Categories() {
  const { categories } = config;

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography
        variant='h4'
        sx={{ mb: 3 }}
      >
        Categories
      </Typography>

      {/* Search/Filter Placeholder */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: '#f5f5f5',
          border: '2px dashed #bdbdbd',
        }}
      >
        <Typography
          variant='h6'
          sx={{ color: '#757575' }}
        >
          Search/Filter (Coming Soon)
        </Typography>
        <Typography
          variant='body2'
          sx={{ color: '#9e9e9e', mt: 1 }}
        >
          Future feature: Filter categories by name or view specific branches
        </Typography>
      </Paper>

      {/* Category Tree Visualization */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <Typography
          variant='h5'
          sx={{ mb: 2 }}
        >
          Category Hierarchy
        </Typography>
        <Typography
          variant='body2'
          sx={{ mb: 2, color: '#666' }}
        >
          Click on category nodes to expand or collapse their subcategories. Use
          keyboard navigation (Enter or Space) to toggle nodes when focused.
          Scroll to zoom, or click and drag to pan the tree.
        </Typography>
        <CategoryTree categories={categories} />
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Category Totals Placeholder */}
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            border: '2px dashed #bdbdbd',
          }}
        >
          <Typography
            variant='h6'
            sx={{ color: '#757575' }}
          >
            Category Totals (Coming Soon)
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: '#9e9e9e', mt: 1 }}
          >
            Future feature: View spending totals for each category and
            subcategory
          </Typography>
        </Paper>

        {/* Category Insights Placeholder */}
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            border: '2px dashed #bdbdbd',
          }}
        >
          <Typography
            variant='h6'
            sx={{ color: '#757575' }}
          >
            Category Insights (Coming Soon)
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: '#9e9e9e', mt: 1 }}
          >
            Future feature: Analytics and trends for your spending by category
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
