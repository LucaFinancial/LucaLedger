import { redirect } from 'react-router-dom';

export const requireAuth = () => {
  const isAuthenticated = localStorage.getItem('token');
  if (!isAuthenticated) {
    return redirect('/login');
  }
  return null;
};
