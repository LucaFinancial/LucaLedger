import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as categoryActions, selectors } from '@/store/categories';

export default function CategoryDialog({
  open,
  onClose,
  category,
  subcategory,
  parentId,
  prePopulateName = '',
}) {
  const dispatch = useDispatch();
  const categories = useSelector(selectors.selectAllCategories);

  const [name, setName] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [errors, setErrors] = useState({});

  // Determine mode: create or edit
  const isEdit = !!(category || subcategory);
  const isSubcategoryEdit = !!subcategory;

  useEffect(() => {
    if (category) {
      // Editing a parent category
      setName(category.name);
      setSelectedParent(null);
    } else if (subcategory && parentId) {
      // Editing a subcategory
      setName(subcategory.name);
      const parentCategory = categories.find((cat) => cat.id === parentId);
      setSelectedParent(parentCategory || null);
    } else if (parentId) {
      // Creating a new subcategory under a specific parent
      setName(prePopulateName || '');
      const parentCategory = categories.find((cat) => cat.id === parentId);
      setSelectedParent(parentCategory || null);
    } else {
      // Creating a new category (default to no parent - top level)
      setName(prePopulateName || '');
      setSelectedParent(null);
    }
    setErrors({});
  }, [open, category, subcategory, parentId, categories, prePopulateName]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Check for duplicate names
    if (!selectedParent) {
      // Creating/editing a top-level category
      const duplicate = categories.find(
        (cat) =>
          cat.name.toLowerCase() === name.trim().toLowerCase() &&
          (!category || cat.id !== category.id)
      );
      if (duplicate) {
        newErrors.name = 'A category with this name already exists';
      }
    } else {
      // Creating/editing a subcategory
      const duplicate = selectedParent.subcategories.find(
        (sub) =>
          sub.name.toLowerCase() === name.trim().toLowerCase() &&
          (!subcategory || sub.id !== subcategory.id)
      );
      if (duplicate) {
        newErrors.name =
          'A subcategory with this name already exists in this category';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    try {
      if (isEdit) {
        if (category) {
          // Update parent category
          dispatch(
            categoryActions.updateCategory(category.id, { name: name.trim() })
          );
        } else if (subcategory && parentId) {
          // Update subcategory
          dispatch(
            categoryActions.updateSubcategory(parentId, subcategory.id, {
              name: name.trim(),
            })
          );
        }
      } else {
        // Create new
        if (!selectedParent) {
          // Create top-level category
          dispatch(categoryActions.createCategory(name.trim()));
        } else {
          // Create subcategory
          dispatch(
            categoryActions.createSubcategory(selectedParent.id, name.trim())
          );
        }
      }
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>
        {isEdit
          ? isSubcategoryEdit
            ? 'Edit Subcategory'
            : 'Edit Category'
          : 'Create New Category'}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin='dense'
          label='Name'
          type='text'
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 2 }}
        />

        {!isEdit && (
          <FormControl
            fullWidth
            sx={{ mb: 2 }}
          >
            <Autocomplete
              value={selectedParent}
              onChange={(event, newValue) => setSelectedParent(newValue)}
              options={categories}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                return option.id === value.id;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Parent Category'
                  placeholder='Search categories or leave empty for top-level'
                  helperText='Leave empty to create a top-level category'
                />
              )}
              clearable
              size='medium'
              fullWidth
            />
          </FormControl>
        )}

        {errors.submit && (
          <Typography
            color='error'
            sx={{ mt: 1 }}
          >
            {errors.submit}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant='contained'
        >
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object, // Parent category to edit
  subcategory: PropTypes.object, // Subcategory to edit
  parentId: PropTypes.string, // Parent ID when editing/creating subcategory
  prePopulateName: PropTypes.string, // Pre-populate the name field
};
