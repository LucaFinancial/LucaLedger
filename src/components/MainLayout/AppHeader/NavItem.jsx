import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const StyledLink = styled(NavLink)`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: 0 18px;
  border-radius: 0;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background-color: white;
    color: #1976d2;
  }
`;

export default function NavItem({ linkTo, navText, end = true }) {
  return (
    <StyledLink to={linkTo} end={end}>
      <Typography
        variant='body2'
        sx={{
          display: 'block',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'inherit',
        }}
      >
        {navText}
      </Typography>
    </StyledLink>
  );
}
