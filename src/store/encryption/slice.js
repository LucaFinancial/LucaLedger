import { createSlice } from '@reduxjs/toolkit';

/**
 * Encryption state management
 * Tracks encryption status, authentication state, and prompts
 */

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
  promptDismissedAt: null,

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
    setPromptDismissedAt: (state, action) => {
      state.promptDismissedAt = action.payload;
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
  setPromptDismissedAt,
  setSessionExpiresAt,
  setError,
  clearError,
  resetEncryptionState,
} = encryptionSlice.actions;

export default encryptionSlice.reducer;
