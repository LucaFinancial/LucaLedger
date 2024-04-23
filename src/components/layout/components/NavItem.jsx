import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  color: white;
  &:hover: {
    text-decoration: underline;
  }
`;

export default function NavItem({ linkTo, navText }) {
  return (
    <StyledLink to={linkTo}>
      <Typography
        variant='body2'
        style={{
          display: 'block',
          marginLeft: '30px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        {navText}
      </Typography>
    </StyledLink>
  );
}

NavItem.propTypes = {
  linkTo: PropTypes.string.isRequired,
  navText: PropTypes.string.isRequired,
};
