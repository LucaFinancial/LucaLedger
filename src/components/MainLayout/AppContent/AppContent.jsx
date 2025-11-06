import { Navigate, Route, Routes } from 'react-router-dom';

import Dashboard from '@/views/Dashboard';

export default function AppContent() {
  return (
    <Routes>
      <Route
        path='/'
        element={<Dashboard />}
      />
      <Route
        path='/dashboard'
        element={
          <Navigate
            to='/'
            replace
          />
        }
      />
      <Route
        path='*'
        element={
          <Navigate
            to='/'
            replace
          />
        }
      />
    </Routes>
  );
}
