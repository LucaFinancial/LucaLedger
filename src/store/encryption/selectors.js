/**
 * Encryption state selectors
 */

export const selectEncryptionStatus = (state) => state.encryption.status;
export const selectAuthStatus = (state) => state.encryption.authStatus;
export const selectShowPrompt = (state) => state.encryption.showPrompt;
export const selectDismissUntil = (state) => state.encryption.dismissUntil;
export const selectEncryptionError = (state) => state.encryption.error;

export const selectIsEncrypted = (state) =>
  state.encryption.status === 'encrypted';
export const selectIsAuthenticated = (state) =>
  state.encryption.authStatus === 'authenticated';
