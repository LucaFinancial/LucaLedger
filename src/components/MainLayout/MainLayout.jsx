import AppContent from './AppContent';
import AppFooter from './AppFooter/AppFooter';
import AppHeader from './AppHeader';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader />
      <div style={{ flex: 1 }}>
        <AppContent />
      </div>
      <AppFooter />
    </div>
  );
}
