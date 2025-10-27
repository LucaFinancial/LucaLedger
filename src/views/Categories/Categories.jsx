import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMemo, useState } from 'react';
import config from '@/config';
import CategoryTotals from './CategoryTotals';
import CategoryTree from './CategoryTree';

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0 = List View, 1 = Tree View

  // Memoize categories to avoid dependency issues
  const categories = useMemo(() => config.categories || [], []);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();

    return categories.filter((category) => {
      // Check if category name matches
      if (category.name.toLowerCase().includes(query)) {
        return true;
      }

      // Check if any subcategory name matches
      return category.subcategories.some((sub) =>
        sub.name.toLowerCase().includes(query)
      );
    });
  }, [categories, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography
        variant='h4'
        sx={{ mb: 3 }}
      >
        Categories
      </Typography>

      {/* View Mode Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          aria-label='category view mode'
        >
          <Tab label='List View' />
          <Tab label='Tree View' />
        </Tabs>
      </Paper>

      {viewMode === 0 ? (
        <>
          {/* Search/Filter */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
            }}
          >
            <TextField
              fullWidth
              placeholder='Search categories...'
              variant='outlined'
              size='small'
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <Typography
                variant='caption'
                sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
              >
                Showing {filteredCategories.length} of {categories.length}{' '}
                {filteredCategories.length === 1 ? 'category' : 'categories'}
              </Typography>
            )}
          </Paper>

          {/* Categories List */}
          <Box sx={{ mb: 3 }}>
            {filteredCategories.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography
                  variant='body1'
                  color='text.secondary'
                >
                  No categories found matching &quot;{searchQuery}&quot;
                </Typography>
              </Paper>
            ) : (
              filteredCategories.map((category) => (
                <Accordion
                  key={category.id}
                  defaultExpanded={false}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${category.slug}-content`}
                    id={`${category.slug}-header`}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                      }}
                    >
                      <Typography
                        variant='h6'
                        component='h2'
                      >
                        {category.name}
                      </Typography>
                      <Chip
                        label={`${category.subcategories.length} ${
                          category.subcategories.length === 1
                            ? 'subcategory'
                            : 'subcategories'
                        }`}
                        size='small'
                        variant='outlined'
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Subcategories List */}
                      <Box sx={{ flexShrink: 0, width: 220 }}>
                        {category.subcategories.length > 0 ? (
                          <List sx={{ pl: 2 }}>
                            {category.subcategories.map((subcategory) => (
                              <ListItem
                                key={subcategory.id}
                                sx={{
                                  py: 1,
                                  borderLeft: '3px solid',
                                  borderColor: 'primary.main',
                                  mb: 0.5,
                                }}
                              >
                                <ListItemText
                                  primary={subcategory.name}
                                  primaryTypographyProps={{
                                    variant: 'body1',
                                    color: 'text.secondary',
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography
                            variant='body2'
                            sx={{
                              pl: 2,
                              fontStyle: 'italic',
                              color: 'text.secondary',
                            }}
                          >
                            No subcategories
                          </Typography>
                        )}
                      </Box>

                      {/* Category Totals */}
                      <Box sx={{ flex: 1 }}>
                        <CategoryTotals category={category} />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        </>
      ) : (
        <>
          {/* Tree View */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography
              variant='body2'
              sx={{ mb: 2, color: '#666' }}
            >
              Click on category nodes to expand or collapse their subcategories.
              Use keyboard navigation (Enter or Space) to toggle nodes when
              focused. Scroll to zoom, or click and drag to pan the tree.
            </Typography>
            <Box sx={{ height: 'calc(100vh - 300px)', minHeight: 600 }}>
              <CategoryTree categories={categories} />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
