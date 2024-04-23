import { Box, Grid } from '@mui/material';

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
          key={1}
        >
          <CreateNewButton />
        </Grid>
      </Grid>
    </Box>
  );
}
