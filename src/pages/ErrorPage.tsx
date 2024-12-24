import { Box, Button, Container, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError() as Error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth='sm'>
        <Box sx={{ textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

          <Typography
            variant='h3'
            gutterBottom
          >
            Oops! Something went wrong
          </Typography>

          <Typography
            color='text.secondary'
            paragraph
          >
            {error?.message || 'Sorry, an unexpected error occurred.'}
          </Typography>

          <Button
            variant='contained'
            size='large'
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ErrorPage;
