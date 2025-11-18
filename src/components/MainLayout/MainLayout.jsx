import AppContent from './AppContent';
import AppHeader from './AppHeader';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader />
      <div style={{ flex: 1, marginTop: '64px' }}>
        <AppContent />
      </div>
    </div>
  );
}
