/**
 * Authentication Context and Provider
 * Manages user authentication state and session
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';

import {
  hasUsers,
  getAllUsers,
  getUserByUsername,
  createUser,
  deleteUser as deleteUserFromDB,
  hasLegacyEncryptedData,
  migrateLegacyDataToUser,
} from '@/crypto/database';
import {
  generateSalt,
  deriveKeyFromPassword,
  generateDataEncryptionKey,
  wrapKey,
  unwrapKey,
  encrypt,
  decrypt,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from '@/crypto/encryption';
import {
  setCurrentUserForMiddleware,
  clearCurrentUserFromMiddleware,
  flushWriteQueueForCurrentSession,
} from '@/store/encryptedMiddleware';

// Sentinel value used to verify password is correct
const SENTINEL_VALUE = 'LUCA_LEDGER_SENTINEL_V1';

// Auth context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeDEK, setActiveDEK] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authState, setAuthState] = useState('loading'); // 'loading', 'no-users', 'login', 'authenticated'

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if any users exist
        const usersExist = await hasUsers();

        if (!usersExist) {
          // Check for legacy encrypted data (from single-user system)
          const hasLegacyEncrypted = await hasLegacyEncryptedData();
          if (hasLegacyEncrypted) {
            // There's legacy encrypted data but no users - need migration
            setAuthState('legacy-migration');
          } else {
            // No users and no data - show registration
            setAuthState('no-users');
          }
        } else {
          setAuthState('login');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState('login');
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (username, password) => {
    // Generate salt for KWK derivation
    const salt = generateSalt();

    // Derive KWK from password
    const kwk = await deriveKeyFromPassword(password, salt);

    // Generate new DEK
    const dek = await generateDataEncryptionKey();

    // Wrap DEK with KWK
    const { wrappedKey, iv: wrappedIV } = await wrapKey(dek, kwk);

    // Create sentinel for password validation
    const { ciphertext: sentinelCiphertext, iv: sentinelIV } = await encrypt(
      SENTINEL_VALUE,
      dek,
    );

    // Generate user ID
    const userId = uuid();

    // Create user in database
    await createUser(
      userId,
      username,
      uint8ArrayToBase64(salt),
      arrayBufferToBase64(wrappedKey),
      uint8ArrayToBase64(wrappedIV),
      arrayBufferToBase64(sentinelCiphertext),
      uint8ArrayToBase64(sentinelIV),
    );

    // Check for legacy data to migrate
    const hasLegacyEncrypted = await hasLegacyEncryptedData();
    if (hasLegacyEncrypted) {
      await migrateLegacyDataToUser(userId);
    }

    // Set middleware user for persistence
    setCurrentUserForMiddleware(userId, dek);

    // Set active state
    setActiveDEK(dek);
    setCurrentUser({ id: userId, username });
    setAuthState('authenticated');

    return { success: true };
  }, []);

  /**
   * Login with username and password
   */
  const login = useCallback(async (username, password) => {
    const user = await getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Derive KWK from password
    const salt = base64ToUint8Array(user.salt);
    const kwk = await deriveKeyFromPassword(password, salt);

    // Try to unwrap DEK
    const wrappedDEK = base64ToArrayBuffer(user.wrappedDEK);
    const wrappedIV = base64ToUint8Array(user.wrappedDEKIV);

    let dek;
    try {
      dek = await unwrapKey(wrappedDEK, wrappedIV, kwk);
    } catch {
      throw new Error('Invalid username or password');
    }

    // Validate with sentinel
    const sentinelCiphertext = base64ToArrayBuffer(user.sentinel);
    const sentinelIV = base64ToUint8Array(user.sentinelIV);

    try {
      const decryptedSentinel = await decrypt(
        sentinelCiphertext,
        sentinelIV,
        dek,
      );
      if (decryptedSentinel !== SENTINEL_VALUE) {
        throw new Error('Invalid username or password');
      }
    } catch {
      throw new Error('Invalid username or password');
    }

    // Set middleware user for persistence
    setCurrentUserForMiddleware(user.id, dek);

    // Set active state
    setActiveDEK(dek);
    setCurrentUser({ id: user.id, username: user.username });
    setAuthState('authenticated');

    return { success: true };
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      // Best-effort flush to reduce data loss on logout.
      await flushWriteQueueForCurrentSession({ timeoutMs: 1500 });
    } finally {
      clearCurrentUserFromMiddleware();
      setActiveDEK(null);
      setCurrentUser(null);
      setAuthState('login');
    }
  }, []);

  /**
   * Delete a user account (requires export first)
   * @param {string} userId - User to delete
   */
  const deleteUserAccount = useCallback(
    async (userId) => {
      // Delete from database
      await deleteUserFromDB(userId);

      // If deleting current user, logout
      if (currentUser?.id === userId) {
        await logout();
      }

      // Check if any users remain
      const usersExist = await hasUsers();
      if (!usersExist) {
        setAuthState('no-users');
      }
    },
    [currentUser, logout],
  );

  /**
   * Get list of all users
   */
  const getUsers = useCallback(async () => {
    return getAllUsers();
  }, []);

  /**
   * Check if username is available
   */
  const isUsernameAvailable = useCallback(async (username) => {
    const user = await getUserByUsername(username);
    return !user;
  }, []);

  const value = {
    currentUser,
    activeDEK,
    isInitialized,
    authState,
    register,
    login,
    logout,
    deleteUserAccount,
    getUsers,
    isUsernameAvailable,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
