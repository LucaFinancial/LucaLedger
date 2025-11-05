import AppContent from './AppContent';
import AppHeader from './AppHeader';
import DeprecationBanner from '@/components/DeprecationBanner';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <DeprecationBanner />
      <AppHeader />
      <div style={{ flex: 1 }}>
        <AppContent />
      </div>
    </div>
  );
}
