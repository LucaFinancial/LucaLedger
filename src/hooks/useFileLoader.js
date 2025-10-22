import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for loading files using a Web Worker
 * Manages worker lifecycle, progress, and cancellation
 */
export default function useFileLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('reading');
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  const loadFile = useCallback((file, onSuccess) => {
    return new Promise((resolve, reject) => {
      // Create worker instance
      const worker = new Worker(
        new URL('../workers/fileLoader.worker.js', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      // Reset state
      setLoading(true);
      setProgress(0);
      setPhase('reading');
      setError(null);

      // Handle worker messages
      worker.onmessage = (event) => {
        const {
          type,
          data,
          schema,
          progress: workerProgress,
          phase: workerPhase,
          error: workerError,
        } = event.data;

        switch (type) {
          case 'progress':
            setProgress(workerProgress);
            setPhase(workerPhase);
            break;

          case 'success':
            setLoading(false);
            worker.terminate();
            workerRef.current = null;
            if (onSuccess) {
              onSuccess(data, schema);
            }
            resolve({ data, schema });
            break;

          case 'error':
            setLoading(false);
            setError(workerError);
            worker.terminate();
            workerRef.current = null;
            reject(new Error(workerError));
            break;

          case 'cancelled':
            setLoading(false);
            worker.terminate();
            workerRef.current = null;
            reject(new Error('Cancelled by user'));
            break;

          default:
            break;
        }
      };

      // Handle worker errors
      worker.onerror = (event) => {
        setLoading(false);
        const errorMessage = event.message || 'Failed to load file';
        setError(errorMessage);
        worker.terminate();
        workerRef.current = null;
        reject(new Error(errorMessage));
      };

      // Start loading
      worker.postMessage({ type: 'load', file });
    });
  }, []);

  const cancelLoad = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'cancel' });
    }
  }, []);

  return {
    loading,
    progress,
    phase,
    error,
    loadFile,
    cancelLoad,
  };
}
