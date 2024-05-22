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

export default function NavItem({ path, text, icon, showIcon }) {
  return (
    <StyledLink to={path}>
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
        {(showIcon && icon) ? icon : text}
      </Typography>
    </StyledLink>
  );
}

NavItem.propTypes = {
  path: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.object,
  showIcon: PropTypes.bool
};
