# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.1-rc.2] - 2026-02-13

### Changed

- Updated `@luca-financial/luca-schema` dependency to `^3.0.1`.
- Standardized statement date producers to canonical `YYYY-MM-DD` format.
- Kept date consumers tolerant of legacy slash-form inputs while preferring canonical matching.
- Added validation fix action plumbing in error dialogs with per-item and bulk hooks.
- Added metadata-driven validation repair in import/load and decrypt flows with per-error and bulk fix support.
- Made validation dialog fixability checks generic (`hasFixableIssues` with date-metadata fallback) so future fixable categories do not require UI rewiring.

### Fixed

- Implemented `fixDateFormatIssues` to apply fix operations to targeted records (replacing previous no-op behavior).

### Tests

- Updated statement utility tests for canonical date behavior with legacy tolerance coverage.
- Added statement slice regression test for slash-date normalization.
- Added data-processing test coverage for schema-driven date-fix flow.
- Added data-processing unit coverage for bulk and per-error fix application behavior.

## [2.2.1-rc.1] - 2026-02-02

### Changed

- Upgraded `react-redux` from v8.1.3 to v9.2.0 for better performance and React 19 compatibility
  - Provides internal optimizations and performance improvements
  - Full compatibility with React 18.3 (current) and React 19 (future)
  - No breaking changes for hooks-only usage pattern (`useSelector`, `useDispatch`)
  - All 222 tests passing
  - No linting errors
  - No runtime warnings or errors

### Notes

- React Redux v9 is mature and stable (released 14+ months ago)
- This is a low-risk upgrade with no code changes required
- Application verified to function normally in all views
- Peer dependency warning about Redux v5 is expected and safe to ignore
  - @reduxjs/toolkit v1.9.7 includes Redux v4.2.1 as a direct dependency
  - React Redux v9 works correctly with Redux v4 via Redux Toolkit
  - Future upgrade to Redux Toolkit v2.x will resolve this warning
