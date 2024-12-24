import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    monthlyReport: true,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
  };

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>Profile Settings</Typography>

      <Card sx={{ p: 3 }}>
        <Stack
          spacing={3}
          alignItems='center'
        >
          <Avatar
            sx={{ width: 120, height: 120 }}
            src='/default-avatar.png'
          />
          <Button variant='outlined'>Change Profile Picture</Button>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleProfileUpdate}>
          <Stack spacing={3}>
            <Typography variant='h6'>Personal Information</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label='First Name'
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label='Last Name'
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </Box>
            <TextField
              fullWidth
              label='Email'
              type='email'
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
            <TextField
              fullWidth
              label='Phone Number'
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
            <Button
              variant='contained'
              type='submit'
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </Card>

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant='h6'>Notifications</Typography>
          <Stack>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography>Email Alerts</Typography>
              <Switch
                checked={notifications.emailAlerts}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    emailAlerts: e.target.checked,
                  })
                }
              />
            </Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography>Push Notifications</Typography>
              <Switch
                checked={notifications.pushNotifications}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    pushNotifications: e.target.checked,
                  })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Monthly Report</Typography>
              <Switch
                checked={notifications.monthlyReport}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    monthlyReport: e.target.checked,
                  })
                }
              />
            </Box>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography
            variant='h6'
            color='error'
          >
            Danger Zone
          </Typography>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant='subtitle1'>Delete Account</Typography>
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Once deleted, your account cannot be recovered
              </Typography>
            </Box>
            <Button
              variant='outlined'
              color='error'
            >
              Delete Account
            </Button>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
};

export default ProfilePage;
