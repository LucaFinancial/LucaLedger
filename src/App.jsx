import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import useVersion from '@/hooks/useVersion';
import store from '@/store';

export default function App() {
  useVersion();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path='*'
              element={<MainLayout />}
            />
          </Routes>
        </Router>
      </Provider>
    </LocalizationProvider>
  );
}
