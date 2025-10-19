import { Navigate, Route, Routes } from 'react-router-dom';

import Accounts from '@/views/Accounts';
import Dashboard from '@/views/Dashboard';
import Landing from '@/views/Landing';
import Ledger from '@/views/Ledger';

export default function AppContent() {
  return (
    <Routes>
      <Route
        path='/'
        element={<Landing />}
      />
      <Route
        path='/dashboard'
        element={<Dashboard />}
      />
      <Route
        path='/accounts'
        element={<Accounts />}
      />
      <Route
        path='/accounts/:accountId'
        element={<Ledger />}
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
