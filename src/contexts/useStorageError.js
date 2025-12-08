/**
 * Hook to access storage error notification system
 */

import { useContext } from 'react';
import { StorageErrorContext } from './StorageErrorContext';

/**
 * Hook to access storage error notification system
 */
export function useStorageError() {
  const context = useContext(StorageErrorContext);
  if (!context) {
    throw new Error(
      'useStorageError must be used within a StorageErrorProvider'
    );
  }
  return context;
}
