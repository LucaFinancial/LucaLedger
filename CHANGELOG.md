# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.7.0] - 2026-04-03

### Added

- Added shared categorized-spending period controls and analytics for the dashboard and categories page, including Current Month, Last 3 Months, YTD, Last 12 Months, month/year filters, and custom date ranges.
- Added state-aware spending summaries for current and future-inclusive ranges with completed, pending, scheduled, planned, total, and monthly average metrics, including recurring transactions in planned totals.
- Added expandable transaction drilldowns for dashboard and category spending tables, with per-transaction date, account, description, amount, and direct edit flows for split and recurring transactions.

### Changed

- Renamed the dashboard Spending History section to Categorized Spending and updated its layout, colors, sorting, pie chart sizing, and optional subcategory hiding behavior.
- Updated the Categories page totals panel to share the new spending controls, support monthly averages, allow subcategory transaction inspection, and align state styling with ledger/dashboard colors.
- Simplified the Current Month Overview header and removed its Spending by Category content.
- Bumped application version to `2.7.0`. (#292)

### Fixed

- Fixed category and dashboard date-range synchronization so aggregate presets populate and clear custom date inputs consistently.
- Fixed split-editor selector memoization warnings on the Categories page and removed React 19 `act(...)` test-environment warnings.
- Fixed the recurring transaction modal category selector width and improved categorized-spending pie chart legend sizing for large category lists.

## [2.6.1] - 2026-04-03

### Fixed

- Fixed ledger split-category behavior so split transactions participate correctly in ledger category filtering, uncategorized views, and invalid-category cleanup.
- Fixed the split transaction modal to preserve in-progress edits instead of resetting split rows while the dialog is open.
- Fixed the split transaction amount field so partial decimal values can be entered and edited naturally without forced reformatting on every keystroke.

## [2.6.0] - 2026-04-03

### Changed

- Upgraded the frontend stack to `react@19`, `react-dom@19`, and Material UI `v7`, and updated related type/build dependencies for compatibility.
- Removed `prop-types` usage across the app and aligned function components with React 19 expectations.
- Updated account type and transaction state labels to render human-friendly text in account cards, account settings, and ledger status selectors.
- Improved the account settings modal by alphabetizing account type options and removing the placeholder recommended settings section.
- Normalized default category seed data through schema migration before loading or resetting categories.
- Bumped application version to `2.6.0`. (#290)

### Fixed

- Fixed account sanitization to strip unsupported fields instead of surfacing validation noise during cleanup and tests.
- Fixed the Settings panel month filter to avoid out-of-range select warnings when the current month is not present in available transaction data.
- Fixed category accordion header actions to avoid invalid nested button markup and related hydration warnings.

## [2.5.1] - 2026-03-18

### Changed

- Upgraded core dependencies including `@luca-financial/luca-schema`, `@mui/x-date-pickers`, `@reduxjs/toolkit`, `react-router-dom`, `@eslint/js`, `eslint`, and `globals`.
- Upgraded test and build tooling to `vitest@^4.1.0`, `@vitest/coverage-v8@^4.1.0`, `vite@^7.3.1`, and `@vitejs/plugin-react@^5.2.0` to keep the toolchain compatible.
- Bumped application version to `2.5.1`. (#288)

## [2.5.0] - 2026-03-14

### Added

- Added a new Spending History dashboard section for historical category-based spending analysis.
- Added aggregate period views for Last 3 Months, YTD, and Last 12 Months.
- Added historical month/year selectors based on available completed transactions.
- Added category breakdown visuals, summary cards, and expandable parent/subcategory spending rows.
- Added a dedicated `useHistoricalCategoryData` hook for period-based spending aggregation.

### Changed

- Refactored Dashboard composition to remove the Recent Activity and Upcoming Activity sections.
- Updated Current Month Overview to be collapsed by default.
- Bumped application version to `2.5.0`. (#287)

## [2.4.0] - 2026-02-21

### Changed

- Removed session token persistence from `sessionStorage` so encryption keys are no longer restorable from web storage.
- Updated authentication flow to require explicit login after refresh/new tab instead of auto-restoring encrypted sessions.
- Simplified encryption setup/unlock flows by removing `stayLoggedIn` and `sessionExpiresAt` state plumbing.
- Updated README and related tests to reflect in-memory key handling and re-authentication behavior.
- Bumped application version to `2.4.0`. (#284)

## [2.3.2] - 2026-02-17

### Changed

- Upgraded `react-router-dom` from `^6.30.3` to `^7.13.0` for React 19 compatibility, improved performance, and latest features.

## [2.3.1] - 2026-02-17

### Fixed

- Fixed bulk edit for transaction state.

## [2.3.0] - 2026-02-16

### Changed

- Migrated all pie charts from Recharts to Chart.js (react-chartjs-2) in CategoryBreakdown, SettingsPanel, and CategoryTotals.
- Removed `recharts` dependency; added `chart.js` and `react-chartjs-2`.
- Added `package-lock.json` to `.gitignore`.

### Fixed

- Fixed SettingsPanel category spending values showing $0.00 by correcting `t.status` to `t.transactionState`.
- Fixed duplicate `deleteEncryptedRecord` imports in recurring transaction action files.

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
