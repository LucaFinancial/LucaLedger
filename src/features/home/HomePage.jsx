import { Box, Typography } from '@mui/material';

import { homeText, lucaBio, legalDisclaimer } from './homePageContent.json';

export default function Home() {
  return (
    <Box>
      <Box
        style={{
          borderBottom: '3px solid black',
          padding: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant='h2'
          style={{ width: '100%', textAlign: 'center', marginBottom: '50px' }}
        >
          Welcome to Luca Ledger
        </Typography>
        <Typography
          variant='body1'
          style={{ width: '75%', textAlign: 'justify', marginBottom: '50px' }}
        >
          {homeText}
        </Typography>
        <Typography
          variant='body1'
          style={{ width: '75%', textAlign: 'justify' }}
        >
          {lucaBio}
        </Typography>
      </Box>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant='subtitle2'
          width='50%'
        >
          {legalDisclaimer}
        </Typography>
      </Box>
    </Box>
  );
}
