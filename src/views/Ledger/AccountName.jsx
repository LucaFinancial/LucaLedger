import { Typography } from '@mui/material';
import { useState } from 'react';

import AccountNameEdit from './AccountNameEdit';

export default function AccountName({ account }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  return (
    <>
      {isEditing ? (
        <AccountNameEdit account={account} setIsEditing={setIsEditing} />
      ) : (
        <Typography
          variant='h3'
          onClick={handleNameClick}
          style={{
            cursor: 'pointer',
          }}
        >
          {account.name}
        </Typography>
      )}
    </>
  );
}

