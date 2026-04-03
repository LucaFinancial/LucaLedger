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
        <Grid key={0}>
          <LoadButton />
        </Grid>
        <Grid key={1}>
          <CreateNewAccountButton />
        </Grid>
        <Grid key={2}>
          <SaveButton />
        </Grid>
        <Grid key={3}>
          <EncryptButton />
        </Grid>
      </Grid>
    </Box>
  );
}
