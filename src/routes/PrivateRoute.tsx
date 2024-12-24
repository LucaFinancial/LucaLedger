import { Navigate, Outlet } from 'react-router-dom';

export function PrivateRoute() {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to='/login'
      replace
    />
  );
}
