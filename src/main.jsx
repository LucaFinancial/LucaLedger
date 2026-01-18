// Note: Legacy localStorage migration is now handled in the auth flow
// See LegacyDataMigrationDialog for the new migration workflow

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
