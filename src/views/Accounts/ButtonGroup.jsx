import { Box, Grid } from '@mui/material';

import LoadButton from './LoadButton';
import SaveAllButton from './SaveAllButton';
import CreateNewButton from './CreateNewButton';

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
        <Grid
          item
          key={0}
        >
          <LoadButton />
        </Grid>
        <Grid
          item
          key={1}
        >
          <CreateNewButton />
        </Grid>
        <Grid
          item
          key={2}
        >
          <SaveAllButton />
        </Grid>
      </Grid>
    </Box>
  );
}
