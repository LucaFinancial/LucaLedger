import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useRef } from 'react';

export default function LoadButton({ onFileLoad }) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileLoad(file);
    }
  };

  return (
    <Box>
      <Button
        variant='contained'
        color='primary'
        onClick={handleImportClick}
      >
        Load From File
      </Button>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileLoad}
        style={{ display: 'none' }}
      />
    </Box>
  );
}

LoadButton.propTypes = {
  onFileLoad: PropTypes.func.isRequired,
};
