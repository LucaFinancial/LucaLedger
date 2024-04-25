import { Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import ActionsMenu from './ActionsMenu';

export default function AccountCard({ account }) {
  const navigate = useNavigate();

  const cardLength = '320px';

  const handleClick = () => {
    navigate(`/accounts/${account.id}`);
  };

  return (
    <Card
      id='AccountCard'
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: cardLength,
        height: cardLength,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
        },
      }}
    >
      <CardContent style={{ position: 'relative' }}>
        <Typography variant='h4'>{account.name}</Typography>
        <Typography variant='body1'>{account.description}</Typography>
      </CardContent>
      {account.entityStatus === 'CLOSED' && (
        <Typography variant='h6'>CLOSED</Typography>
      )}
      <ActionsMenu account={account} />
    </Card>
  );
}

AccountCard.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    entityStatus: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};
