import { createTheme } from '@mui/material';

// Custom theme options
export const theme = createTheme({
  palette: {
    primary: {
      main: '#646cff', // Matching your CSS variables
      light: '#535bf2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#747bff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9f9f9',
    },
    text: {
      primary: '#213547',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '3.2em',
      lineHeight: 1.1,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.6em 1.2em',
          transition: 'border-color 0.25s',
          '&:hover': {
            borderColor: '#646cff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
