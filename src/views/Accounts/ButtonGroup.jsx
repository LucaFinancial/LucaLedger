import { Box, Grid } from '@mui/material';

import LoadButton from './LoadButton';
import CreateNewAccountButton from './CreateNewAccountButton';
import SaveButton from './SaveButton';
import EncryptButton from './EncryptButton';

export default function ButtonGroup() {
  return (
    <Box
      style={{
        marginTop: '10px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Grid
        container
        spacing={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Grid key={0} size='auto'>
          <LoadButton />
        </Grid>
        <Grid key={1} size='auto'>
          <CreateNewAccountButton />
        </Grid>
        <Grid key={2} size='auto'>
          <SaveButton />
        </Grid>
        <Grid key={3} size='auto'>
          <EncryptButton />
        </Grid>
      </Grid>
    </Box>
  );
}
