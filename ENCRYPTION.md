# Encryption Feature Documentation

## Overview

Luca Ledger now supports optional client-side encryption of all financial data stored in the browser. This feature uses industry-standard encryption algorithms to protect your sensitive financial information at rest.

## Security Details

### Encryption Algorithm
- **AES-GCM 256-bit encryption** - Military-grade encryption standard
- **Unique Initialization Vectors (IVs)** - Each record is encrypted with a unique IV to enhance security
- **Per-record encryption** - Changes to one record don't require re-encrypting the entire dataset

### Key Derivation
- **PBKDF2** with 100,000 iterations (OWASP recommended minimum)
- **SHA-256** hashing algorithm
- **Random 128-bit salt** - Unique salt generated for each user

### Key Management
- **Data Encryption Key (DEK)** - 256-bit key used to encrypt all user data
- **Key Wrapping Key (KWK)** - Derived from password, used to wrap the DEK
- **Non-extractable KWK** - Stored in memory only, cannot be exported
- **DEK never persisted in plaintext** - Only stored as wrapped (encrypted) version

### Password Requirements
- **Generated passwords**: 24 characters with 143-bit entropy
  - Mix of uppercase, lowercase, numbers, and special characters
  - Exceeds 128-bit entropy requirement
- **Custom passwords**: Minimum 8 characters
  - Users are encouraged to use strong passwords

## User Experience

### Initial Setup
1. **Encryption Prompt** - Shows on first load after update for users with existing data
   - Three options: "Encrypt Now", "Remind Me Later", "Dismiss"
   - Re-prompts every 2 days if dismissed
   - No prompt if no data exists yet

2. **Password Setup**
   - Option to generate a secure password
   - Option to enter custom password
   - Copy button for generated passwords
   - Password visibility toggle
   - "Stay logged in" checkbox (14 days)

3. **Migration Process**
   - Progress indicator shown during encryption
   - Data migrated from localStorage to IndexedDB
   - Original plaintext data deleted after successful migration

### Daily Use
1. **Unlock Dialog** - Shows when app is opened and data is encrypted
   - Enter password to decrypt and access data
   - Option to stay logged in (14 days)
   - Session token stored securely

2. **Encryption Status** - Visible in app header
   - Shows current encryption state
   - Tooltip with additional information

3. **File Downloads** - Warning shown when downloading data
   - Downloaded files are NOT encrypted
   - Users reminded to secure exported files

## Technical Implementation

### Storage Architecture
- **IndexedDB** - Used for encrypted data storage (via Dexie library)
- **Three stores**:
  - `accounts` - Encrypted account records
  - `transactions` - Encrypted transaction records
  - `metadata` - Unencrypted metadata (salt, wrapped DEK, IVs)

### Record Format
Each encrypted record contains:
```javascript
{
  id: string,           // Record identifier
  iv: string,           // Base64-encoded initialization vector
  ciphertext: string    // Base64-encoded encrypted data
}
```

### Performance Optimizations
- **Batch operations** - Multiple records encrypted/decrypted in parallel
- **Write throttling** - Writes to IndexedDB delayed by 1 second and batched
- **Async loading** - Large datasets loaded with small delays to prevent UI freezing
  - Batching kicks in at >100 accounts or >1000 transactions

### Session Management
- **Stay logged in** - Optional 14-day session
- **Session token** - Contains wrapped DEK, stored in localStorage
- **Automatic expiration** - Token expires after 14 days
- **Manual logout** - Clears session token and DEK from memory

## Security Considerations

### Strengths
✅ Client-side encryption - Data never sent to servers  
✅ Industry-standard algorithms (AES-GCM, PBKDF2)  
✅ Strong key derivation (100,000 iterations)  
✅ Non-extractable keys  
✅ Unique IVs per record  
✅ High-entropy password generation (143-bit)  

### Important Warnings
⚠️ **Password Recovery** - If you forget your password, your data CANNOT be recovered  
⚠️ **File Exports** - Downloaded files are NOT encrypted  
⚠️ **Browser Storage** - Data is encrypted in browser storage, but memory is not encrypted during active use  
⚠️ **Session Tokens** - "Stay logged in" stores wrapped DEK in localStorage  

### Best Practices
1. **Store password in a password manager** (1Password, Bitwarden, etc.)
2. **Use the generated password option** for maximum security
3. **Secure exported files** - Store in encrypted folders or password-protected archives
4. **Regular backups** - Export and securely store backups of your data
5. **Avoid "Stay logged in" on shared devices**

## Future Enhancements

Potential future improvements:
- Password change functionality
- Biometric authentication (WebAuthn)
- Multi-factor authentication
- Encryption strength options
- Data recovery options (with security tradeoffs)
- Option to disable encryption (with appropriate warnings)

## Migration Path

### From Unencrypted to Encrypted
1. User clicks "Encrypt Now" in prompt dialog
2. User sets up password (generated or custom)
3. Data is read from localStorage
4. Data is encrypted with DEK
5. Encrypted data written to IndexedDB
6. Original localStorage data deleted
7. User can now access encrypted data with password

### No Downgrade Path
⚠️ **Important**: Once data is encrypted, there is currently no way to downgrade to unencrypted storage. This is intentional to prevent accidental exposure of sensitive data.

## Troubleshooting

### "Incorrect password" error
- Verify password is correct (check caps lock, etc.)
- If password is truly lost, data cannot be recovered
- Restore from backup if available

### Data migration fails
- Check browser console for error messages
- Ensure sufficient IndexedDB storage quota
- Try clearing browser cache (WARNING: may lose data)

### Performance issues
- Encryption/decryption is CPU-intensive
- Large datasets may take longer to load
- Consider reducing transaction history if performance is critical

### Session expiration
- "Stay logged in" sessions expire after 14 days
- Re-enter password to continue accessing data
- Session token is automatically renewed when used

## Technical Support

For issues or questions:
1. Check browser console for error messages
2. Review this documentation
3. Open an issue on GitHub with details
4. Include browser version and dataset size (account/transaction count)

**Never share your encryption password with anyone, including technical support.**
