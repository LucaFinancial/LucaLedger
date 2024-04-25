import { Box, /*Button,*/ TextField } from '@mui/material';
import { useState } from 'react';
// import { useDispatch } from 'react-redux';

// import { actions } from '@/store/categories';

export default function CreateNewCategory() {
  // const dispatch = useDispatch();
  const [newCategoryName, setNewCategoryName] = useState('');

  // const handleCreateNewCategory = () => {
  //   dispatch(actions.createNewCategory({ name: newCategoryName }));
  //   setNewCategoryName('');
  // };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <TextField
        value={newCategoryName}
        onChange={(event) => setNewCategoryName(event.target.value)}
      />
      {/* <Button onClick={handleCreateNewCategory}>Create New Category</Button> */}
    </Box>
  );
}
