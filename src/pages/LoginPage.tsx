import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement login logic
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
      }}
    >
      <Card sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Stack spacing={3}>
          <div>
            <Typography
              variant='h4'
              gutterBottom
            >
              Sign in
            </Typography>
            <Typography color='textSecondary'>
              Enter your details below.
            </Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label='Email address'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!error}
                required
              />

              <TextField
                fullWidth
                label='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error}
                helperText={error}
                required
              />

              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <FormControlLabel
                  control={<Checkbox />}
                  label='Remember me'
                />
                <Link
                  href='/forgot-password'
                  variant='body2'
                >
                  Forgot password?
                </Link>
              </Stack>

              <Button
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </form>

          <Typography
            variant='body2'
            align='center'
          >
            Don't have an account?{' '}
            <Link
              href='/register'
              variant='subtitle2'
            >
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
};

export default LoginPage;
