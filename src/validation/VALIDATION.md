# Validation System Documentation

## Overview

Luca Ledger uses **JSON Schema** for data validation, validated by **AJV (Another JSON Schema Validator)**. This approach provides:

- **Schema-based validation**: Declarative schemas that are easier to understand and maintain
- **Industry standard**: JSON Schema is a widely adopted standard (RFC 8259)
- **Better error reporting**: Detailed validation errors with clear messages
- **Extensibility**: Easy to add custom validators and formats
- **Type safety**: Strong type checking without automatic coercion

## Architecture

The validation system is organized in the `/src/validation` directory:

```
src/validation/
├── index.js                  # Main export file
├── validator.js              # AJV configuration and validation functions
├── accountSchemas.js         # JSON Schema definitions for accounts
└── transactionSchemas.js     # JSON Schema definitions for transactions
```

## AJV Configuration

The AJV validator is configured with the following settings:

```javascript
const ajv = new Ajv({
  strict: true,        // Enforces strict schema validation
  allErrors: true,     // Collects all validation errors, not just the first
  useDefaults: true,   // Applies default values from schemas
  coerceTypes: false,  // No automatic type coercion for better type safety
});
```

Additionally, **ajv-formats** is used to add support for standard string formats (date, email, uri, etc.).

## Usage

### Validating Accounts

```javascript
import { validateAccount, validateAccountSync } from '@/validation';

// Async validation (returns result object)
const result = validateAccount(accountData, 'Checking');
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Sync validation (throws error)
try {
  validateAccountSync(accountData, 'Checking');
} catch (error) {
  console.error('Validation failed:', error.message);
  console.error('All errors:', error.errors);
}
```

### Validating Transactions

```javascript
import { validateTransaction, validateTransactionSync } from '@/validation';

// Async validation (returns result object)
const result = validateTransaction(transactionData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Sync validation (throws error)
try {
  validateTransactionSync(transactionData);
} catch (error) {
  console.error('Validation failed:', error.message);
  console.error('All errors:', error.errors);
}
```

## Schemas

### Account Schemas

Three account types are supported, each with its own schema:

#### Checking & Savings Accounts

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "minLength": 1 },
    "name": { "type": "string", "minLength": 1 },
    "type": { "type": "string", "minLength": 1 }
  },
  "required": ["id", "name", "type"],
  "additionalProperties": false
}
```

#### Credit Card Accounts

Credit Card accounts extend the common schema with a `statementDay` field:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "minLength": 1 },
    "name": { "type": "string", "minLength": 1 },
    "type": { "type": "string", "minLength": 1 },
    "statementDay": { 
      "type": "integer", 
      "minimum": 1, 
      "maximum": 31 
    }
  },
  "required": ["id", "name", "type", "statementDay"],
  "additionalProperties": false
}
```

### Transaction Schema

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "minLength": 1 },
    "accountId": { "type": "string", "minLength": 1 },
    "status": { 
      "type": "string", 
      "enum": ["pending ", "complete ", "scheduled ", "planned "]
    },
    "date": { 
      "type": "string", 
      "pattern": "^\\d{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$" 
    },
    "amount": { "type": "number" },
    "description": { "type": "string", "minLength": 1 }
  },
  "required": ["id", "accountId", "status", "date", "amount", "description"],
  "additionalProperties": true
}
```

**Note**: 
- Transaction dates use the format `YYYY/MM/DD` (e.g., `2025/10/26`) as defined in the application config.
- Status values have trailing spaces (this is the existing implementation in `TransactionStatusEnum`).

## Error Messages

The validation system formats AJV errors into user-friendly messages:

| Error Type | Example Message |
|------------|----------------|
| `required` | "name is required" |
| `type` | "amount must be a number" |
| `minLength` | "description must not be empty" |
| `minimum` | "statementDay must be at least 1" |
| `maximum` | "statementDay must be at most 31" |
| `enum` | "status must be one of: pending, complete, scheduled, planned" |
| `pattern` | "date must match the required format" |
| `additionalProperties` | "Unknown property: invalidField" |

## Migration from Yup

### Key Differences

1. **No type coercion**: AJV does not automatically convert types (e.g., string to number)
2. **Stricter validation**: JSON Schema validation is more explicit about types and formats
3. **Different API**: Use `validateSync()` instead of Yup's `schema.validateSync()`
4. **Date format**: Custom pattern for `YYYY/MM/DD` instead of standard date format

### Backward Compatibility

Compatibility wrappers are provided in `/src/store/accounts/schemas.js` and `/src/store/transactions/schemas.js` to maintain the existing API:

```javascript
// Old code (still works)
import schemas from './schemas';
schemas[accountType].validateSync(account);

// New code (recommended)
import { validateAccountSync } from '@/validation';
validateAccountSync(account, accountType);
```

## Adding New Schemas

To add validation for new data models:

1. Create a schema file in `/src/validation/` (e.g., `categorySchemas.js`)
2. Define your JSON Schema according to the JSON Schema specification
3. Export the schema in the standard format
4. Import and compile the schema in `validator.js`
5. Create validation functions (e.g., `validateCategory`, `validateCategorySync`)
6. Export the functions from `/src/validation/index.js`

Example:

```javascript
// categorySchemas.js
export const categorySchemas = {
  category: {
    $id: 'category',
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
    },
    required: ['id', 'name'],
    additionalProperties: false
  }
};
```

## Resources

- [JSON Schema Official Site](https://json-schema.org/)
- [AJV Documentation](https://ajv.js.org/)
- [JSON Schema Specification](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [AJV Formats](https://github.com/ajv-validator/ajv-formats)
