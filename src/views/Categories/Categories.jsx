import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ClearIcon from '@mui/icons-material/Clear';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as categoryActions,
  selectors,
  setCategories,
} from '@/store/categories';
import CategoryDialog from '@/components/CategoryDialog';
import CategoryTotals from './CategoryTotals';
import CategoryTree from './CategoryTree';
import categoriesData from '@/config/categories.json';

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector(selectors.selectAllCategories);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0 = List View, 1 = Tree View
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editingParentId, setEditingParentId] = useState(null);
  const [searchHovered, setSearchHovered] = useState(false);

  // Filter and sort categories based on search query
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Filter based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = categories.filter((category) => {
        // Check if category name matches
        if (category.name.toLowerCase().includes(query)) {
          return true;
        }

        // Check if any subcategory name matches
        return category.subcategories.some((sub) =>
          sub.name.toLowerCase().includes(query)
        );
      });
    }

    // Sort categories alphabetically and sort subcategories within each category
    return result
      .map((category) => ({
        ...category,
        subcategories: [...category.subcategories].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setEditingSubcategory(null);
    setEditingParentId(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditingSubcategory(null);
    setEditingParentId(null);
    setDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      dispatch(categoryActions.deleteCategory(categoryId));
    }
  };

  const handleCreateSubcategory = (parentId) => {
    setEditingCategory(null);
    setEditingSubcategory(null);
    setEditingParentId(parentId);
    setDialogOpen(true);
  };

  const handleEditSubcategory = (parentId, subcategory) => {
    setEditingCategory(null);
    setEditingSubcategory(subcategory);
    setEditingParentId(parentId);
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = (parentId, subcategoryId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this subcategory? This action cannot be undone.'
      )
    ) {
      dispatch(categoryActions.deleteSubcategory(parentId, subcategoryId));
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setEditingParentId(null);
  };

  const handleResetCategories = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all categories to the default set? This will delete all your custom categories and cannot be undone.'
      )
    ) {
      dispatch(setCategories([...categoriesData.categories]));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4'>Categories</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='outlined'
            startIcon={<RestartAltIcon />}
            onClick={handleResetCategories}
            color='warning'
          >
            Reset Categories
          </Button>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
          >
            New Category
          </Button>
        </Box>
      </Box>

      {/* View Mode Tabs and Search */}
      <Paper sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 2,
            pb: 2,
          }}
        >
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            aria-label='category view mode'
            sx={{ flex: 1 }}
          >
            <Tab label='List View' />
            <Tab label='Tree View' />
          </Tabs>
          <TextField
            placeholder='Search categories...'
            variant='outlined'
            size='small'
            value={searchQuery}
            onChange={handleSearchChange}
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            sx={{ width: 610 }} // Increased by 75% (350 * 1.75 ≈ 610)
            InputProps={{
              endAdornment: searchQuery && (searchHovered || searchQuery) && (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='clear search'
                    onClick={handleClearSearch}
                    edge='end'
                    size='small'
                  >
                    <ClearIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {searchQuery && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary' }}
            >
              Showing {filteredCategories.length} of {categories.length}{' '}
              {filteredCategories.length === 1 ? 'category' : 'categories'}
            </Typography>
          </Box>
        )}
      </Paper>

      {viewMode === 0 ? (
        <>
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
                        sx={{ flex: 1 }}
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
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                        title='Edit category'
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        title='Delete category'
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Subcategories List */}
                      <Box sx={{ flexShrink: 0, width: 300 }}>
                        <Box
                          sx={{
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant='subtitle2'>
                            Subcategories
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={() => handleCreateSubcategory(category.id)}
                            title='Add subcategory'
                          >
                            <AddIcon fontSize='small' />
                          </IconButton>
                        </Box>
                        {category.subcategories.length > 0 ? (
                          <List sx={{ py: 0, pl: 0 }}>
                            {category.subcategories.map((subcategory) => (
                              <ListItem
                                key={subcategory.id}
                                sx={{
                                  py: 0.5,
                                  pl: 2,
                                  pr: 10, // Add right padding to prevent overlap with buttons
                                  borderLeft: '3px solid',
                                  borderColor: 'primary.main',
                                  mb: 0.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                secondaryAction={
                                  <Box>
                                    <IconButton
                                      edge='end'
                                      size='small'
                                      onClick={() =>
                                        handleEditSubcategory(
                                          category.id,
                                          subcategory
                                        )
                                      }
                                      title='Edit subcategory'
                                      sx={{ mr: 0.5 }}
                                    >
                                      <EditIcon fontSize='small' />
                                    </IconButton>
                                    <IconButton
                                      edge='end'
                                      size='small'
                                      onClick={() =>
                                        handleDeleteSubcategory(
                                          category.id,
                                          subcategory.id
                                        )
                                      }
                                      title='Delete subcategory'
                                    >
                                      <DeleteIcon fontSize='small' />
                                    </IconButton>
                                  </Box>
                                }
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
            <Box sx={{ height: 'calc(100vh - 330px)', minHeight: 450 }}>
              <CategoryTree categories={filteredCategories} />
            </Box>
          </Paper>
        </>
      )}

      <CategoryDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        category={editingCategory}
        subcategory={editingSubcategory}
        parentId={editingParentId}
      />
    </Box>
  );
}
