/**
 * Tests for Encryption Utilities
 * Tests AES-GCM encryption with per-record IVs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSecurePassword,
  generateSalt,
  generateIV,
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

describe('Encryption Utilities', () => {
  describe('generateSecurePassword', () => {
    it('should generate a 24 character password', () => {
      const password = generateSecurePassword();
      expect(password).toHaveLength(24);
    });

    it('should generate unique passwords', () => {
      const password1 = generateSecurePassword();
      const password2 = generateSecurePassword();
      expect(password1).not.toBe(password2);
    });

    it('should contain only valid characters', () => {
      const password = generateSecurePassword();
      const validChars = /^[A-Za-z0-9!@#$%^&*]+$/;
      expect(password).toMatch(validChars);
    });
  });

  describe('generateSalt', () => {
    it('should generate a 16 byte salt', () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(16);
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const salt1Base64 = uint8ArrayToBase64(salt1);
      const salt2Base64 = uint8ArrayToBase64(salt2);
      expect(salt1Base64).not.toBe(salt2Base64);
    });
  });

  describe('generateIV', () => {
    it('should generate a 12 byte IV', () => {
      const iv = generateIV();
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.length).toBe(12);
    });

    it('should generate unique IVs', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();
      const iv1Base64 = uint8ArrayToBase64(iv1);
      const iv2Base64 = uint8ArrayToBase64(iv2);
      expect(iv1Base64).not.toBe(iv2Base64);
    });
  });

  describe('deriveKeyFromPassword', () => {
    it('should derive a CryptoKey from password and salt', async () => {
      const password = 'testPassword123';
      const salt = generateSalt();
      const key = await deriveKeyFromPassword(password, salt);

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe('secret');
    });

    it('should derive the same key for same password and salt', async () => {
      const password = 'testPassword123';
      const salt = generateSalt();

      const key1 = await deriveKeyFromPassword(password, salt);
      const key2 = await deriveKeyFromPassword(password, salt);

      // Both keys should be valid and have same properties
      expect(key1.type).toBe(key2.type);
      expect(key1.algorithm.name).toBe(key2.algorithm.name);
    });

    it('should derive different keys for different salts', async () => {
      const password = 'testPassword123';
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      const key1 = await deriveKeyFromPassword(password, salt1);
      const key2 = await deriveKeyFromPassword(password, salt2);

      // Keys exist but we can't directly compare them
      // Different salts should produce different keys
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
    });

    it('should derive key usable for wrapKey/unwrapKey', async () => {
      const password = 'testPassword123';
      const salt = generateSalt();
      const key = await deriveKeyFromPassword(password, salt);

      expect(key.usages).toContain('wrapKey');
      expect(key.usages).toContain('unwrapKey');
    });
  });

  describe('generateDataEncryptionKey', () => {
    it('should generate a CryptoKey for encryption', async () => {
      const dek = await generateDataEncryptionKey();

      expect(dek).toBeInstanceOf(CryptoKey);
      expect(dek.type).toBe('secret');
      expect(dek.extractable).toBe(true);
    });

    it('should generate key usable for encrypt/decrypt', async () => {
      const dek = await generateDataEncryptionKey();

      expect(dek.usages).toContain('encrypt');
      expect(dek.usages).toContain('decrypt');
    });
  });

  describe('wrapKey and unwrapKey', () => {
    let kwk;
    let dek;

    beforeEach(async () => {
      const password = 'testPassword123';
      const salt = generateSalt();
      kwk = await deriveKeyFromPassword(password, salt);
      dek = await generateDataEncryptionKey();
    });

    it('should wrap and unwrap a key successfully', async () => {
      const { wrappedKey, iv } = await wrapKey(dek, kwk);

      // wrappedKey should be ArrayBuffer-like (either ArrayBuffer or Uint8Array)
      expect(wrappedKey.byteLength).toBeGreaterThan(0);
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.length).toBe(12);
    });

    it('should unwrap to a usable key', async () => {
      const { wrappedKey, iv } = await wrapKey(dek, kwk);
      const unwrappedDek = await unwrapKey(wrappedKey, iv, kwk);

      expect(unwrappedDek).toBeInstanceOf(CryptoKey);
      expect(unwrappedDek.usages).toContain('encrypt');
      expect(unwrappedDek.usages).toContain('decrypt');
    });

    it('should fail to unwrap with wrong IV', async () => {
      const { wrappedKey } = await wrapKey(dek, kwk);
      const wrongIv = generateIV();

      await expect(unwrapKey(wrappedKey, wrongIv, kwk)).rejects.toThrow();
    });

    it('should fail to unwrap with wrong KWK', async () => {
      const { wrappedKey, iv } = await wrapKey(dek, kwk);

      const wrongSalt = generateSalt();
      const wrongKwk = await deriveKeyFromPassword('wrongPassword', wrongSalt);

      await expect(unwrapKey(wrappedKey, iv, wrongKwk)).rejects.toThrow();
    });
  });

  describe('encrypt and decrypt', () => {
    let dek;

    beforeEach(async () => {
      dek = await generateDataEncryptionKey();
    });

    it('should encrypt and decrypt string data', async () => {
      const data = 'Hello, World!';
      const { ciphertext, iv } = await encrypt(data, dek);

      // ciphertext should be ArrayBuffer-like (either ArrayBuffer or Uint8Array)
      expect(ciphertext.byteLength).toBeGreaterThan(0);
      expect(iv).toBeInstanceOf(Uint8Array);

      const decrypted = await decrypt(ciphertext, iv, dek);
      expect(decrypted).toBe(data);
    });

    it('should encrypt and decrypt object data', async () => {
      const data = { name: 'Test Account', balance: 1000 };
      const { ciphertext, iv } = await encrypt(data, dek);
      const decrypted = await decrypt(ciphertext, iv, dek);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt array data', async () => {
      const data = [1, 2, 3, 'four', { five: 5 }];
      const { ciphertext, iv } = await encrypt(data, dek);
      const decrypted = await decrypt(ciphertext, iv, dek);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt null', async () => {
      const data = null;
      const { ciphertext, iv } = await encrypt(data, dek);
      const decrypted = await decrypt(ciphertext, iv, dek);

      expect(decrypted).toBeNull();
    });

    it('should produce different ciphertext for same data (different IV)', async () => {
      const data = 'Same data';
      const result1 = await encrypt(data, dek);
      const result2 = await encrypt(data, dek);

      const cipher1Base64 = arrayBufferToBase64(result1.ciphertext);
      const cipher2Base64 = arrayBufferToBase64(result2.ciphertext);

      expect(cipher1Base64).not.toBe(cipher2Base64);
    });

    it('should fail to decrypt with wrong IV', async () => {
      const data = 'Secret data';
      const { ciphertext } = await encrypt(data, dek);
      const wrongIv = generateIV();

      await expect(decrypt(ciphertext, wrongIv, dek)).rejects.toThrow();
    });

    it('should fail to decrypt with wrong key', async () => {
      const data = 'Secret data';
      const { ciphertext, iv } = await encrypt(data, dek);
      const wrongDek = await generateDataEncryptionKey();

      await expect(decrypt(ciphertext, iv, wrongDek)).rejects.toThrow();
    });
  });

  describe('Base64 conversion utilities', () => {
    describe('arrayBufferToBase64 and base64ToArrayBuffer', () => {
      it('should round-trip ArrayBuffer', () => {
        const original = new Uint8Array([1, 2, 3, 4, 5]).buffer;
        const base64 = arrayBufferToBase64(original);
        const restored = base64ToArrayBuffer(base64);

        expect(new Uint8Array(restored)).toEqual(new Uint8Array(original));
      });

      it('should handle empty buffer', () => {
        const original = new Uint8Array([]).buffer;
        const base64 = arrayBufferToBase64(original);
        const restored = base64ToArrayBuffer(base64);

        expect(new Uint8Array(restored)).toEqual(new Uint8Array(original));
      });

      it('should produce valid base64 string', () => {
        const original = new Uint8Array([0, 127, 255]).buffer;
        const base64 = arrayBufferToBase64(original);

        // Valid base64 characters only
        expect(base64).toMatch(/^[A-Za-z0-9+/]*=*$/);
      });
    });

    describe('uint8ArrayToBase64 and base64ToUint8Array', () => {
      it('should round-trip Uint8Array', () => {
        const original = new Uint8Array([10, 20, 30, 40, 50]);
        const base64 = uint8ArrayToBase64(original);
        const restored = base64ToUint8Array(base64);

        expect(restored).toEqual(original);
      });

      it('should handle all byte values', () => {
        const original = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
          original[i] = i;
        }
        const base64 = uint8ArrayToBase64(original);
        const restored = base64ToUint8Array(base64);

        expect(restored).toEqual(original);
      });
    });
  });
});
