import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
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
}) {
  const dispatch = useDispatch();
  const categories = useSelector(selectors.selectAllCategories);

  const [name, setName] = useState('');
  const [type, setType] = useState('parent'); // 'parent' or 'subcategory'
  const [selectedParentId, setSelectedParentId] = useState('');
  const [errors, setErrors] = useState({});

  // Determine mode: create or edit
  const isEdit = !!(category || subcategory);
  const isSubcategoryEdit = !!subcategory;

  useEffect(() => {
    if (category) {
      // Editing a parent category
      setName(category.name);
      setType('parent');
    } else if (subcategory && parentId) {
      // Editing a subcategory
      setName(subcategory.name);
      setType('subcategory');
      setSelectedParentId(parentId);
    } else if (parentId) {
      // Creating a new subcategory under a specific parent
      setName('');
      setType('subcategory');
      setSelectedParentId(parentId);
    } else {
      // Creating a new category (default to parent)
      setName('');
      setType('parent');
      setSelectedParentId('');
    }
    setErrors({});
  }, [open, category, subcategory, parentId]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (type === 'subcategory' && !selectedParentId) {
      newErrors.parent = 'Parent category is required';
    }

    // Check for duplicate names
    if (type === 'parent') {
      const duplicate = categories.find(
        (cat) =>
          cat.name.toLowerCase() === name.trim().toLowerCase() &&
          (!category || cat.id !== category.id)
      );
      if (duplicate) {
        newErrors.name = 'A category with this name already exists';
      }
    } else {
      const parent = categories.find((cat) => cat.id === selectedParentId);
      if (parent) {
        const duplicate = parent.subcategories.find(
          (sub) =>
            sub.name.toLowerCase() === name.trim().toLowerCase() &&
            (!subcategory || sub.id !== subcategory.id)
        );
        if (duplicate) {
          newErrors.name =
            'A subcategory with this name already exists in this category';
        }
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
        if (type === 'parent') {
          dispatch(categoryActions.createCategory(name.trim()));
        } else {
          dispatch(
            categoryActions.createSubcategory(selectedParentId, name.trim())
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
            component='fieldset'
            sx={{ mb: 2 }}
          >
            <FormLabel component='legend'>Type</FormLabel>
            <RadioGroup
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <FormControlLabel
                value='parent'
                control={<Radio />}
                label='Top Level Category'
              />
              <FormControlLabel
                value='subcategory'
                control={<Radio />}
                label='Subcategory'
              />
            </RadioGroup>
          </FormControl>
        )}

        {type === 'subcategory' && !isEdit && (
          <FormControl
            fullWidth
            error={!!errors.parent}
            sx={{ mb: 2 }}
          >
            <FormLabel>Parent Category</FormLabel>
            <RadioGroup
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
            >
              {categories.map((cat) => (
                <FormControlLabel
                  key={cat.id}
                  value={cat.id}
                  control={<Radio />}
                  label={cat.name}
                />
              ))}
            </RadioGroup>
            {errors.parent && (
              <div
                style={{
                  color: '#d32f2f',
                  fontSize: '0.75rem',
                  marginTop: '4px',
                }}
              >
                {errors.parent}
              </div>
            )}
          </FormControl>
        )}

        {errors.submit && (
          <div style={{ color: '#d32f2f', marginTop: '8px' }}>
            {errors.submit}
          </div>
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
};
