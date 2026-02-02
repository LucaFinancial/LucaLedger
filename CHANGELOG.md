# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
