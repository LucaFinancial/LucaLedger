import { doublePrecisionFormatString } from '@/utils';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const AccountRow = ({ account }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Grid
        container
        spacing={2}
        alignItems='center'
      >
        <Grid
          item
          xs={12}
          sm={3}
        >
          <Typography variant='h6'>{account.name}</Typography>
          <Typography
            color='textSecondary'
            variant='body2'
          >
            {account.type}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={9}
        >
          <Grid
            container
            spacing={2}
          >
            {['current', 'pending', 'scheduled', 'future'].map((type) => (
              <Grid
                item
                xs={6}
                sm={3}
                key={type}
              >
                <Typography
                  variant='body2'
                  color='textSecondary'
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Typography>
                <Typography variant='h6'>
                  ${doublePrecisionFormatString(account[type])}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

AccountRow.propTypes = {
  account: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    current: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
    scheduled: PropTypes.number.isRequired,
    future: PropTypes.number.isRequired,
  }).isRequired,
};

export default AccountRow;
