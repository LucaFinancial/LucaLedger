import { Box, Button, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/categories';

export default function CategoryRow({ category }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category.name);

  const handleDeleteCategory = () => {
    dispatch(actions.removeCategoryById(category.id));
  };

  const handleUpdateCategoryName = () => {
    dispatch(actions.updateCategoryName(category.id, newCategoryName));
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleUpdateCategoryName();
    }
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5px',
        width: '250px',
        border: '1px solid black',
      }}
    >
      {isEditing ? (
        <TextField
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        category.name
      )}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {isEditing ? (
          <Button onClick={handleUpdateCategoryName}>Update</Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        )}
        <Button onClick={handleDeleteCategory}>Delete</Button>
      </Box>
    </Box>
  );
}

CategoryRow.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * {categories.map((category) => (
        <Box
          key={category.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '5px',
            width: '250px',
            border: '1px solid black',
          }}
        >
          {category.name}
        </Box>
      ))}
 */
