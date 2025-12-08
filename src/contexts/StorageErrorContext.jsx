/**
 * Storage Error Notification Context
 * Provides a global notification system for storage errors
 * Used to display user-friendly error messages when IndexedDB operations fail
 */

import { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Snackbar, Alert } from '@mui/material';
import { getUserFriendlyErrorMessage } from '@/crypto/retryUtils';

const StorageErrorContext = createContext(null);

// Export context for use in hook
StorageErrorContext.displayName = 'StorageErrorContext';
export { StorageErrorContext };

/**
 * Storage Error Provider Component
 */
export function StorageErrorProvider({ children }) {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  /**
   * Show a storage error notification
   * @param {Error} error - The error to display
   * @param {string} customMessage - Optional custom message
   */
  const showStorageError = useCallback((error, customMessage = null) => {
    const message = customMessage || getUserFriendlyErrorMessage(error);
    setNotification({
      open: true,
      message,
      severity: 'error',
    });
  }, []);

  /**
   * Show a warning notification
   * @param {string} message - Warning message to display
   */
  const showWarning = useCallback((message) => {
    setNotification({
      open: true,
      message,
      severity: 'warning',
    });
  }, []);

  /**
   * Close the notification
   */
  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <StorageErrorContext.Provider
      value={{
        showStorageError,
        showWarning,
        closeNotification,
      }}
    >
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={10000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </StorageErrorContext.Provider>
  );
}

StorageErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
