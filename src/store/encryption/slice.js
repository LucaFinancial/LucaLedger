import { createSlice } from '@reduxjs/toolkit';

/**
 * Encryption state management
 * Tracks encryption status, authentication state, and prompts
 */

// Load dismiss until timestamp from localStorage
const loadDismissUntil = () => {
  try {
    const stored = localStorage.getItem('encryptionPromptDismissUntil');
    return stored ? parseInt(stored, 10) : null;
  } catch (error) {
    console.error('Failed to load encryption prompt dismiss state:', error);
    return null;
  }
};

export const EncryptionStatus = {
  UNENCRYPTED: 'unencrypted',
  ENCRYPTING: 'encrypting',
  ENCRYPTED: 'encrypted',
};

export const AuthStatus = {
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
};

const initialState = {
  // Encryption status
  status: EncryptionStatus.UNENCRYPTED,

  // Authentication status
  authStatus: AuthStatus.UNAUTHENTICATED,

  // Prompt management
  showPrompt: false,
  dismissUntil: loadDismissUntil(),

  // Session management
  sessionExpiresAt: null,

  // Error tracking
  error: null,
};

const encryptionSlice = createSlice({
  name: 'encryption',
  initialState,
  reducers: {
    setEncryptionStatus: (state, action) => {
      state.status = action.payload;
    },
    setAuthStatus: (state, action) => {
      state.authStatus = action.payload;
    },
    setShowPrompt: (state, action) => {
      state.showPrompt = action.payload;
    },
    setDismissUntil: (state, action) => {
      state.dismissUntil = action.payload;
      // Persist to localStorage
      if (action.payload !== null) {
        localStorage.setItem(
          'encryptionPromptDismissUntil',
          String(action.payload),
        );
      } else {
        localStorage.removeItem('encryptionPromptDismissUntil');
      }
    },
    setSessionExpiresAt: (state, action) => {
      state.sessionExpiresAt = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetEncryptionState: () => initialState,
  },
});

export const {
  setEncryptionStatus,
  setAuthStatus,
  setShowPrompt,
  setDismissUntil,
  setSessionExpiresAt,
  setError,
  clearError,
  resetEncryptionState,
} = encryptionSlice.actions;

export default encryptionSlice.reducer;
