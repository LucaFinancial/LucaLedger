import { Navigate, Route, Routes } from 'react-router-dom';

import Accounts from '@/views/Accounts';
import Categories from '@/views/Categories';
import Dashboard from '@/views/Dashboard';
import Ledger from '@/views/Ledger';

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
        path='/accounts'
        element={<Accounts />}
      />
      <Route
        path='/accounts/:accountId'
        element={<Ledger />}
      />
      <Route
        path='/categories'
        element={<Categories />}
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
