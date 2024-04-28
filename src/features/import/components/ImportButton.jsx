import { Button } from '@mui/material';

import { useImport } from '../hooks';

export default function ImportButton() {
  const { importAllItems, importSelectedItems } = useImport();
  return (
    <>
      <Button
        variant='contained'
        onClick={importAllItems}
      >
        Import All
      </Button>
      <Button
        variant='contained'
        onClick={importSelectedItems}
      >
        Import Selected
      </Button>
    </>
  );
}
