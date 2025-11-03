import { Autocomplete, Box, TextField, Typography, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectors as categorySelectors } from '@/store/categories';
import CategoryDialog from '@/components/CategoryDialog';

export default function CategorySelect({
  value,
  onChange,
  size = 'small',
  variant = 'outlined',
  label = 'Category',
  placeholder = '',
  error = false,
  helperText = '',
  fullWidth = false,
}) {
  const categories = useSelector(categorySelectors.selectAllCategories);
  const flatCategories = useSelector(categorySelectors.selectAllCategoriesFlat);
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Build options list with parent categories and their subcategories
  const options = useMemo(() => {
    const opts = [];

    categories.forEach((category) => {
      // Add parent category
      opts.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        isParent: true,
        group: category.name,
      });

      // Add subcategories
      category.subcategories.forEach((subcategory) => {
        opts.push({
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
          isParent: false,
          group: category.name,
          parentName: category.name,
        });
      });
    });

    return opts;
  }, [categories]);

  // Check if the current categoryId is valid
  const isInvalidCategory = useMemo(() => {
    if (!value) return false;
    return !flatCategories.some((cat) => cat.id === value);
  }, [value, flatCategories]);

  // Find the current selected option
  const selectedOption = useMemo(() => {
    if (!value) return null;
    const found = options.find((opt) => opt.id === value);
    // If invalid category, create a placeholder option
    if (!found) {
      return {
        id: value,
        name: 'Invalid category',
        slug: 'invalid',
        isParent: false,
        group: 'Invalid',
      };
    }
    return found;
  }, [value, options]);

  // Filter options based on input and add "Create new" option if applicable
  const filteredOptions = useMemo(() => {
    let baseOptions =
      isInvalidCategory && selectedOption
        ? [...options, selectedOption]
        : options;

    // If there's input and few matches, show create option
    if (inputValue && inputValue.trim()) {
      const query = inputValue.toLowerCase();
      const matches = baseOptions.filter((opt) =>
        opt.name.toLowerCase().includes(query)
      );

      // If less than 4 matches and input doesn't exactly match an existing category
      const exactMatch = matches.some(
        (opt) => opt.name.toLowerCase() === query
      );

      if (matches.length < 4 && !exactMatch) {
        return [
          {
            id: '__create__',
            name: `Create "${inputValue}"`,
            slug: '__create__',
            isParent: false,
            group: '➕ Create New',
            isCreateOption: true,
          },
          ...baseOptions,
        ];
      }
    }

    return baseOptions;
  }, [options, inputValue, isInvalidCategory, selectedOption]);

  const handleChange = (event, newValue) => {
    if (newValue) {
      if (newValue.id === '__create__') {
        // Open dialog to create new category
        setDialogOpen(true);
      } else {
        onChange(newValue.id);
      }
    } else {
      onChange(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setInputValue('');
  };

  const handleCategoryCreated = () => {
    // The dialog will handle creation, we just need to close it
    handleDialogClose();
  };

  return (
    <>
      <Autocomplete
        value={selectedOption}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={filteredOptions}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          return option.id === value.id;
        }}
        disableClearable={false}
        renderInput={(params) => {
          const inputProps = {
            ...params.InputProps,
          };
          if (variant === 'standard') {
            inputProps.disableUnderline = true;
          }

          return (
            <TextField
              {...params}
              label={label}
              placeholder={isInvalidCategory ? 'Invalid category' : placeholder}
              size={size}
              variant={variant}
              error={error || isInvalidCategory}
              helperText={helperText}
              sx={
                isInvalidCategory
                  ? {
                      '& .MuiInputBase-input': {
                        color: 'error.main',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'error.main',
                        opacity: 1,
                      },
                    }
                  : undefined
              }
              InputProps={inputProps}
            />
          );
        }}
        renderOption={(props, option) => (
          <Box
            component='li'
            {...props}
            sx={{
              pl: option.isParent ? 2 : 4,
              fontWeight: option.isParent ? 'bold' : 'normal',
              color: option.isCreateOption ? 'primary.main' : 'inherit',
              fontStyle: option.isCreateOption ? 'italic' : 'normal',
            }}
          >
            {option.isCreateOption && (
              <AddIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            )}
            {option.name}
          </Box>
        )}
        renderGroup={(params) => (
          <li key={params.key}>
            <Typography
              variant='caption'
              sx={{
                pl: 1,
                pt: 1,
                pb: 0.5,
                fontWeight: 'bold',
                color:
                  params.group === '➕ Create New'
                    ? 'primary.main'
                    : 'text.secondary',
                display: 'block',
              }}
            >
              {params.group}
            </Typography>
            <ul style={{ padding: 0 }}>{params.children}</ul>
          </li>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.name}
              size={size}
            />
          ))
        }
        size={size}
        fullWidth={fullWidth}
        sx={{ minWidth: fullWidth ? undefined : 200 }}
      />

      <CategoryDialog
        open={dialogOpen}
        onClose={handleCategoryCreated}
        category={null}
        subcategory={null}
        parentId={null}
      />
    </>
  );
}

CategorySelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
};
