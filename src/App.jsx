import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AuthProvider } from '@/auth';
import { AuthScreen, ProtectedRoute } from '@/components/Auth';
import MainLayout from '@/components/MainLayout/MainLayout';
import SchemaVersionProvider from '@/components/SchemaVersionProvider';
import VersionProvider from '@/components/VersionProvider';
import EncryptionProvider from '@/components/EncryptionProvider';
import store from '@/store';

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <AuthProvider>
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
        </AuthProvider>
      </Provider>
    </LocalizationProvider>
  );
}
