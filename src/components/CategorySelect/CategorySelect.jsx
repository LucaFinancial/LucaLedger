import { Autocomplete, Box, TextField, Typography, Chip } from '@mui/material';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectors as categorySelectors } from '@/store/categories';

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

  // Include invalid category in options if present
  const optionsWithInvalid = useMemo(() => {
    if (isInvalidCategory && selectedOption) {
      return [...options, selectedOption];
    }
    return options;
  }, [options, isInvalidCategory, selectedOption]);

  const handleChange = (event, newValue) => {
    if (newValue) {
      onChange(newValue.id);
    } else {
      onChange(null);
    }
  };

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      options={optionsWithInvalid}
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
          }}
        >
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
              color: 'text.secondary',
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
