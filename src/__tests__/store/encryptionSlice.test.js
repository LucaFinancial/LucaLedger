/**
 * Tests for Encryption Redux Slice
 * Tests encryption state management actions and reducers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import encryptionReducer, {
  setEncryptionStatus,
  setAuthStatus,
  setShowPrompt,
  setDismissUntil,
  setError,
  clearError,
  resetEncryptionState,
  EncryptionStatus,
  AuthStatus,
} from '@/store/encryption/slice';

describe('Encryption Slice', () => {
  const initialState = {
    status: EncryptionStatus.UNENCRYPTED,
    authStatus: AuthStatus.UNAUTHENTICATED,
    showPrompt: false,
    dismissUntil: null,
    error: null,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('reducers', () => {
    describe('setEncryptionStatus', () => {
      it('should set status to UNENCRYPTED', () => {
        const state = encryptionReducer(
          initialState,
          setEncryptionStatus(EncryptionStatus.UNENCRYPTED),
        );
        expect(state.status).toBe(EncryptionStatus.UNENCRYPTED);
      });

      it('should set status to ENCRYPTING', () => {
        const state = encryptionReducer(
          initialState,
          setEncryptionStatus(EncryptionStatus.ENCRYPTING),
        );
        expect(state.status).toBe(EncryptionStatus.ENCRYPTING);
      });

      it('should set status to ENCRYPTED', () => {
        const state = encryptionReducer(
          initialState,
          setEncryptionStatus(EncryptionStatus.ENCRYPTED),
        );
        expect(state.status).toBe(EncryptionStatus.ENCRYPTED);
      });
    });

    describe('setAuthStatus', () => {
      it('should set auth status to UNAUTHENTICATED', () => {
        const state = encryptionReducer(
          initialState,
          setAuthStatus(AuthStatus.UNAUTHENTICATED),
        );
        expect(state.authStatus).toBe(AuthStatus.UNAUTHENTICATED);
      });

      it('should set auth status to AUTHENTICATING', () => {
        const state = encryptionReducer(
          initialState,
          setAuthStatus(AuthStatus.AUTHENTICATING),
        );
        expect(state.authStatus).toBe(AuthStatus.AUTHENTICATING);
      });

      it('should set auth status to AUTHENTICATED', () => {
        const state = encryptionReducer(
          initialState,
          setAuthStatus(AuthStatus.AUTHENTICATED),
        );
        expect(state.authStatus).toBe(AuthStatus.AUTHENTICATED);
      });
    });

    describe('setShowPrompt', () => {
      it('should set showPrompt to true', () => {
        const state = encryptionReducer(initialState, setShowPrompt(true));
        expect(state.showPrompt).toBe(true);
      });

      it('should set showPrompt to false', () => {
        const promptState = { ...initialState, showPrompt: true };
        const state = encryptionReducer(promptState, setShowPrompt(false));
        expect(state.showPrompt).toBe(false);
      });
    });

    describe('setDismissUntil', () => {
      it('should set dismissUntil timestamp', () => {
        const timestamp = Date.now() + 86400000; // +1 day
        const state = encryptionReducer(
          initialState,
          setDismissUntil(timestamp),
        );

        expect(state.dismissUntil).toBe(timestamp);
      });

      it('should persist dismissUntil to localStorage', () => {
        const timestamp = Date.now() + 86400000;
        encryptionReducer(initialState, setDismissUntil(timestamp));

        expect(localStorage.setItem).toHaveBeenCalledWith(
          'encryptionPromptDismissUntil',
          String(timestamp),
        );
      });

      it('should clear dismissUntil with null', () => {
        const dismissedState = { ...initialState, dismissUntil: Date.now() };
        const state = encryptionReducer(dismissedState, setDismissUntil(null));

        expect(state.dismissUntil).toBeNull();
      });

      it('should remove from localStorage when set to null', () => {
        encryptionReducer(initialState, setDismissUntil(null));

        expect(localStorage.removeItem).toHaveBeenCalledWith(
          'encryptionPromptDismissUntil',
        );
      });
    });

    describe('setError', () => {
      it('should set error message', () => {
        const state = encryptionReducer(
          initialState,
          setError('Authentication failed'),
        );
        expect(state.error).toBe('Authentication failed');
      });

      it('should accept error object', () => {
        const errorObj = { code: 'AUTH_FAILED', message: 'Invalid password' };
        const state = encryptionReducer(initialState, setError(errorObj));
        expect(state.error).toEqual(errorObj);
      });
    });

    describe('clearError', () => {
      it('should clear error', () => {
        const errorState = { ...initialState, error: 'Some error' };
        const state = encryptionReducer(errorState, clearError());
        expect(state.error).toBeNull();
      });
    });

    describe('resetEncryptionState', () => {
      it('should reset to initial state', () => {
        const modifiedState = {
          status: EncryptionStatus.ENCRYPTED,
          authStatus: AuthStatus.AUTHENTICATED,
          showPrompt: true,
          dismissUntil: Date.now(),
          error: 'Some error',
        };
        const state = encryptionReducer(modifiedState, resetEncryptionState());

        expect(state.status).toBe(EncryptionStatus.UNENCRYPTED);
        expect(state.authStatus).toBe(AuthStatus.UNAUTHENTICATED);
        expect(state.showPrompt).toBe(false);
        expect(state.error).toBeNull();
      });
    });
  });

  describe('EncryptionStatus enum', () => {
    it('should have correct values', () => {
      expect(EncryptionStatus.UNENCRYPTED).toBe('unencrypted');
      expect(EncryptionStatus.ENCRYPTING).toBe('encrypting');
      expect(EncryptionStatus.ENCRYPTED).toBe('encrypted');
    });
  });

  describe('AuthStatus enum', () => {
    it('should have correct values', () => {
      expect(AuthStatus.UNAUTHENTICATED).toBe('unauthenticated');
      expect(AuthStatus.AUTHENTICATING).toBe('authenticating');
      expect(AuthStatus.AUTHENTICATED).toBe('authenticated');
    });
  });
});
