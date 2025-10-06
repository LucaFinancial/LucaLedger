import { useLocation } from 'react-router-dom';

import AppContent from './AppContent';
import AppFooter from './AppFooter/AppFooter';
import AppHeader from './AppHeader';

export default function MainLayout() {
  const location = useLocation();
  const isLedgerView = location.pathname.startsWith('/accounts/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader />
      <div style={{ flex: 1 }}>
        <AppContent />
      </div>
      {!isLedgerView && <AppFooter />}
    </div>
  );
}
