# Luca Ledger

This is the original version of Luca Ledger. The most modern version (v2) is located at lucaledger.app and is a more advanced version of what this app was intended to do.

## Version 2.0.0 Highlights

Version 2.0.0 represents a major architectural upgrade with improved data management and future extensibility:

### Key Features & Improvements

- **Normalized Redux State Management**: Transitioned from legacy nested account/transaction stores to normalized Redux slices with separate `accounts` and `transactions` stores for better performance and data consistency
- **Schema Version Tracking**: Introduced `SchemaVersionProvider` for tracking and managing data schema versions, enabling smoother migrations for future updates
- **Enhanced Data Actions**: Comprehensive new account actions supporting create, load, save, update, and remove operations with automatic transaction handling
- **Improved Data Access**: Components now use optimized selectors to fetch transactions by account or account IDs, improving performance and reliability
- **Automatic Data Migration**: Seamless one-time migration from legacy data format to normalized structure with accountId tracking on all transactions
- **Breaking Changes**: All references to legacy stores have been replaced with the new normalized architecture throughout the codebase 