# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.4] - 2026-02-15

### Changed

- Upgraded `@reduxjs/toolkit` from `^1.9.7` to `^2.5.0` (resolved to 2.11.2).
- Converted dynamic `import()` calls to static imports for `deleteEncryptedRecord` and `batchStoreUserEncryptedRecords` across store action files and encrypted middleware.
- Removed dashboard placeholder cards for Monthly Summary, Tabbed Data Views, and Balance Trend Chart.

## [2.2.3] - 2026-02-14

### Added

- Added custom interval support to recurring transactions, replacing hardcoded frequency options with a flexible interval field.
- Added interval number input field for specifying custom intervals (e.g., "Every 3 Weeks" or "Every 4 Days").

### Changed

- Updated frequency labels to plural forms (Days, Weeks, Months, Years).
- Removed Bi-Weekly special case, now handled as "Every 2 Weeks".
- Improved accessibility with aria-label on interval input and placeholder text.

## [2.2.2] - 2026-02-14

### Changed

- Resolved merge conflicts after integrating `main` into `copilot/upgrade-react-redux-v9`.
- Kept the React Redux v9 and Luca schema v3 upgrade line intact (`react-redux@^9.2.0`, `@luca-financial/luca-schema@^3.0.2`).
- Added and retained repository updates merged from `main`, including the PR template and README updates.

### Documentation

- Consolidated changelog history into stable release entries without RC sections.
- Bumped application version to `2.2.2` to reflect post-merge reconciliation changes.

## [2.2.1] - 2026-02-14

### Changed

- Upgraded `react-redux` from `8.1.3` to `9.2.0`.
- Updated `@luca-financial/luca-schema` dependency to `^3.0.2`.
- Standardized statement date producers to canonical `YYYY-MM-DD` format.
- Added validation fix action plumbing in error dialogs with per-item and bulk hooks.
- Added ledger-owned date repair metadata generation in import/load and decrypt validation flows.
- Updated schema version usage to rely on contract `SCHEMA_VERSION` from `lucaSchema`.
- Hardened schema-version parsing to normalize `X.Y.Z` from suffixed values and reject invalid formats.
- Added explicit hard-fail handling for files created with newer schema versions.
- Added dedicated user-facing upgrade guidance when future schema versions are detected during load.
- Preserved recurring events with invalid dates during pruning so validation/remediation can resolve them safely.
- Made validation dialog fixability checks generic (`hasFixableIssues` with date-metadata fallback) so future fixable categories do not require UI rewiring.
- Removed selector-level date normalization for statement and transaction date comparisons.
- Refactored code structure and refreshed supporting documentation.

### Fixed

- Implemented `fixDateFormatIssues` to apply fix operations to targeted records (replacing previous no-op behavior).

### Tests

- Updated statement utility tests for canonical date behavior with legacy tolerance coverage.
- Added statement slice regression test for slash-date normalization.
- Added data-processing test coverage for schema-driven date-fix flow.
- Added data-processing unit coverage for bulk and per-error fix application behavior.

## [2.2.0] - 2026-02-01

### Fixed

- Fixed recurring transaction fix/load behavior to prevent failed recurring recovery flow.

## [2.1.1] - 2026-01-31

### Fixed

- Fixed incomplete export behavior by including missing data stores in account export payloads.

## [2.1.0] - 2026-01-18

### Changed

- Finalized and published the `2.1.0` release line from beta builds.

## [2.0.4] - 2026-01-17

### Changed

- Removed the legacy data migration dialog and aligned migration flow with the current startup process.

## [2.0.3] - 2025-12-19

### Fixed

- Fixed year filtering to prevent transactions from unrelated years from appearing in filtered views.

## [2.0.2] - 2025-12-19

### Fixed

- Fixed a `BulkEditModal` crash caused by incorrect date validation method usage.

## [2.0.1] - 2025-12-15

### Changed

- Updated GitHub Actions workflows and removed deprecated repository files.
- Updated Copilot instruction content for navigation, test expectations, and security/authentication guidance.

## [2.0.0] - 2025-12-06

### Added

- Added local login/registration with mandatory encrypted storage.
- Added monthly statement support and statement lock/unlock persistence in IndexedDB.
- Added sample data support and backend-focused test coverage.
- Added idempotent import behavior for ledger files.

### Changed

- Promoted the `2.0.0` line from beta to stable release status.
- Migrated date utilities from Day.js to date-fns.
- Centralized statement balance calculations and added out-of-sync detection.
- Enhanced dashboard and ledger UX for improved transaction workflows.

### Fixed

- Fixed statement and credit card statement UI/persistence issues discovered during the beta cycle.
