/**
 * Validation Module
 *
 * This module provides JSON Schema-based validation for all data models
 * in the Luca Ledger application using AJV (Another JSON Schema Validator).
 *
 * Schemas:
 * - Account schemas: Define validation rules for Checking, Savings, and Credit Card accounts
 * - Transaction schema: Define validation rules for transactions
 *
 * Validators:
 * - validateAccount/validateAccountSync: Validate account data
 * - validateTransaction/validateTransactionSync: Validate transaction data
 *
 * For more details, see individual schema and validator files.
 */

export { default as accountSchemas } from './accountSchemas';
export { default as transactionSchemas } from './transactionSchemas';
export * from './validator';
export { default as validator } from './validator';
