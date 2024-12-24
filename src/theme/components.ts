import { Components } from '@mui/material';

export const components: Components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        margin: 0,
        minWidth: '320px',
        minHeight: '100vh',
      },
      a: {
        fontWeight: 500,
        color: '#646cff',
        textDecoration: 'inherit',
        '&:hover': {
          color: '#535bf2',
        },
      },
    },
  },
};
