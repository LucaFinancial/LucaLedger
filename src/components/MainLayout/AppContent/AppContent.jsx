import { Navigate, Route, Routes } from 'react-router-dom';

import Accounts from '@/views/Accounts';
import Categories from '@/views/Categories';
import Dashboard from '@/views/Dashboard';
import Help from '@/views/Help';
import Landing from '@/views/Landing';
import Ledger from '@/views/Ledger';
import Settings from '@/views/Settings';

export default function AppContent() {
  return (
    <Routes>
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/home' element={<Landing />} />
      <Route path='/accounts' element={<Accounts />} />
      <Route path='/accounts/:accountId' element={<Ledger />} />
      <Route path='/categories' element={<Categories />} />
      <Route path='/settings' element={<Settings />} />
      <Route path='/help' element={<Help />} />
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}
