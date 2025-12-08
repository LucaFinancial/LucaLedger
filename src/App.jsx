import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AuthProvider } from '@/auth';
import { AuthScreen, ProtectedRoute } from '@/components/Auth';
import MainLayout from '@/components/MainLayout/MainLayout';
import SchemaVersionProvider from '@/components/SchemaVersionProvider';
import VersionProvider from '@/components/VersionProvider';
import EncryptionProvider from '@/components/EncryptionProvider';
import { StorageErrorProvider } from '@/contexts/StorageErrorContext';
import store from '@/store';

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Provider store={store}>
        <AuthProvider>
          <StorageErrorProvider>
            <CssBaseline />
            <Router>
              <Routes>
                <Route
                  path='/login'
                  element={<AuthScreen />}
                />
                <Route
                  path='/*'
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
            <EncryptionProvider />
            <SchemaVersionProvider />
            <VersionProvider />
          </StorageErrorProvider>
        </AuthProvider>
      </Provider>
    </LocalizationProvider>
  );
}
