# Luca Ledger - GitHub Copilot Instructions

Luca Ledger is a React-based personal finance management application for tracking expenses across multiple account types (Checking, Savings, Credit Card). Built with React 18.2, Vite, Material-UI, Redux Toolkit, and React Router.

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Development Setup

- **Install dependencies**: `pnpm install` -- takes 40 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
- **Development server**: `pnpm dev` -- starts Vite dev server on http://localhost:5173
- **Production build**: `pnpm build` -- takes 15 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- **Preview production build**: `pnpm preview` -- serves built files on http://localhost:4173
- **Code quality**: `pnpm lint` -- runs ESLint, takes 2 seconds

### Build Process Details

- Build generates optimized files in `dist/` directory
- Build includes special handling for GitHub Pages deployment (copies CNAME and creates 404.html)
- Build warnings about large chunks (736KB+) are normal and expected
- **NEVER CANCEL** any build commands - they complete reliably within documented timeframes

### Development Server

- Vite dev server starts in ~230ms after dependencies are installed
- Hot reload and fast refresh enabled
- Application shows version update dialog on first load (click OK to dismiss)
- **NEVER CANCEL** long-running dev server - use Ctrl+C or stop_bash to terminate

## Validation and Testing

### Manual Validation Steps

After making changes, ALWAYS test these user scenarios:

1. **Navigation**: Test navigation between Dashboard (/dashboard) and Accounts (/accounts)
2. **Account Creation**: Click "Create New Account" button to verify account creation works
3. **UI Responsiveness**: Verify Material-UI components render correctly
4. **Version Display**: Check that version number appears in top-right (format: vX.Y.Z)

### Code Quality Requirements

- **ALWAYS** run `pnpm lint` before completing changes - CI will fail otherwise
- **Run tests**: `pnpm test` runs Vitest test suite
- ESLint configuration enforces React, accessibility, and import standards
- Prettier formatting is integrated with ESLint

### CI/CD Validation

- GitHub Actions automatically builds and deploys to GitHub Pages on push to main
- Actions use Node.js 24 and pnpm for builds
- Build artifacts are deployed to GitHub Pages at the configured domain

## Application Architecture

### Key Technologies

- **React 18.2**: Main UI framework with modern hooks
- **Vite 4.5**: Build tool and dev server for fast development
- **Material-UI 5.14**: Component library for consistent UI
- **Redux Toolkit 1.9**: State management for accounts and transactions
- **React Router 6.17**: Client-side routing
- **Day.js**: Date manipulation library

### Security Architecture

Luca Ledger uses client-side encryption for all financial data:

- **Encryption**: AES-GCM 256-bit with unique IVs per record
- **Key Derivation**: PBKDF2 with 100,000 iterations (SHA-256)
- **Key Management**: Data Encryption Key (DEK) wrapped by password-derived Key Wrapping Key (KWK)
- **Storage**: IndexedDB via Dexie library (not localStorage)
- **Sessions**: 3-day session tokens with wrapped DEK
- **No server-side storage**: All data stays on the user's device
- **File exports are NOT encrypted**: Users must secure exported files separately

See `ENCRYPTION.md` for full implementation details and `src/crypto/` for the encryption utilities.

### Authentication System

Multi-user authentication with password-based encryption:

- **Auth states**: `loading`, `no-users`, `login`, `authenticated`, `legacy-migration`
- **User creation**: Username + password, password derives encryption keys
- **Session management**: 3-day sessions stored in sessionStorage
- **No password recovery**: By design (client-side encryption means lost password = lost data)
- **Legacy migration**: Handles migration from older unencrypted data formats

See `src/auth/AuthContext.jsx` for the auth provider and `src/components/Auth/` for login/registration components.

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── MainLayout/      # App header, navigation, layout
│   ├── Auth/            # Authentication components (LoginForm, RegistrationForm)
│   ├── EncryptionProvider/ # Encryption context and setup
│   └── ...              # Many more - explore as needed
├── views/               # Main application pages
│   ├── Dashboard/       # Financial overview
│   ├── Accounts/        # Account management
│   ├── Ledger/          # Transaction ledger
│   ├── Categories/      # Category management
│   ├── Settings/        # App settings
│   ├── Help/            # User help
│   └── Landing/         # Welcome/info page
├── store/               # Redux store and slices
│   ├── accounts/        # Account state management
│   ├── transactions/    # Transaction state management
│   ├── categories/      # Category state management
│   ├── statements/      # Statement state management
│   └── encryption/      # Encryption state
├── auth/                # Authentication context
├── crypto/              # Encryption utilities (AES-256, key management)
├── validation/          # Zod schemas for data validation (see src/validation/VALIDATION.md)
├── config/              # Application configuration
├── constants/           # Schema constants and enums
├── hooks/               # Custom React hooks
├── __tests__/           # Vitest test suites
└── main.jsx             # Application entry point
```

### Important Files

- `package.json`: Dependencies, scripts, version number
- `vite.config.js`: Build configuration with @ alias for src/
- `.eslintrc`: Code quality rules and React-specific linting
- `Dockerfile`: Multi-stage build (note: fails in sandboxed environments due to cert issues)
- `ENCRYPTION.md`: Documentation for encryption implementation
- `CHANGELOG.md`: Version history and release notes

## Common Tasks

### Dependency Management

- Uses pnpm 9.x as package manager (defined in package.json)
- Dependencies are locked with pnpm-lock.yaml
- Install new packages with `pnpm add <package>`
- Development dependencies with `pnpm add -D <package>`

### Code Navigation

- Use `@/` alias for imports from src/ directory (configured in vite.config.js)
- Components use index.js files for clean imports
- Redux slices follow standard Redux Toolkit patterns

### Configuration Files Reference

- `.eslintrc`: React/JSX linting rules, import resolution, accessibility checks
- `.prettierrc`: Code formatting rules (2 spaces, single quotes, trailing commas)
- `.gitignore`: Excludes node_modules, dist, logs, editor files
- `vite.config.js`: Build config with React plugin and path aliases

### Versioning

- Version number is in package.json and displayed in app header
- **ALWAYS** update version when making changes to the codebase using semantic versioning
- Use `npm version <major|minor|patch>` to auto-update package.json
- CI/CD uses version for deployment tagging

#### Semantic Versioning Guidelines

Luca Ledger follows [Semantic Versioning 2.0.0](https://semver.org/) with the format MAJOR.MINOR.PATCH:

**MAJOR version** (X.0.0) - Increment when making incompatible changes:

- Breaking changes to data structure (e.g., account schema changes that require migration)
- Removing features or components
- Changing APIs that affect saved account files
- Changes that require users to take action (e.g., clear IndexedDB data)
- **Command**: `npm version major`

**MINOR version** (1.X.0) - Increment when adding functionality in a backward-compatible manner:

- New features (e.g., new account types, new views, new components)
- New UI components or pages
- Enhanced functionality to existing features
- New configuration options
- Performance improvements that users will notice
- **Command**: `npm version minor`

**PATCH version** (1.8.X) - Increment when making backward-compatible bug fixes:

- Bug fixes that don't add new features
- UI/UX improvements and styling changes
- Documentation updates
- Refactoring code without changing behavior
- Dependency updates (unless they add new features)
- Performance optimizations
- Accessibility improvements
- **Command**: `npm version patch`

#### Version Update Process

1. **Before making changes**: Check current version in package.json
2. **After completing changes**: Determine the appropriate version increment based on the guidelines above
3. **Update version**: Run `npm version <major|minor|patch>` from the repository root
4. **Verify**: Check that package.json has been updated correctly
5. **Commit**: Include the version change in your commit

#### Examples

- Adding a new "Investment Account" type → **MINOR** version bump (new feature)
- Fixing a bug where dates display incorrectly → **PATCH** version bump (bug fix)
- Changing the account data schema in a breaking way → **MAJOR** version bump (breaking change)
- Improving button styling → **PATCH** version bump (UI improvement)
- Adding export to PDF feature → **MINOR** version bump (new feature)
- Updating Material-UI from 5.14 to 5.15 → **PATCH** version bump (dependency update)
- Removing support for old account format → **MAJOR** version bump (breaking change)

#### Release Candidate Versioning for Issues

When working on GitHub issues, use release candidate (RC) versioning to track development progress:

**On First Commit for a New Issue:**

1. Determine the appropriate version increment (major, minor, or patch) based on the issue type
2. Update package.json version with `-rc.1` suffix
3. Commit with message: `chore: bump to X.Y.Z-rc.1`

**On Subsequent Commits on the Same Branch:**

1. Increment only the RC number (e.g., `-rc.1` → `-rc.2` → `-rc.3`)
2. Keep the base version unchanged
3. Commit with message: `chore: bump to X.Y.Z-rc.N`

**Manual Update Commands:**

```bash
# First commit on new issue (adds -rc.1):
# Determine version type, then manually update package.json
# OR use: npm version <major|minor|patch> --preid=rc --no-git-tag-version
# Then manually add -rc.1 suffix if npm command doesn't add it

# Subsequent commits (increment RC number):
# Manually update package.json RC number
# Example: change "1.9.0-rc.1" to "1.9.0-rc.2"
```

**RC Versioning Examples:**

- Working on issue to add new feature:
  - First commit: `1.8.8` → `1.9.0-rc.1` (minor bump + RC)
  - Second commit: `1.9.0-rc.1` → `1.9.0-rc.2` (increment RC only)
  - Third commit: `1.9.0-rc.2` → `1.9.0-rc.3` (increment RC only)
- Working on issue to fix a bug:
  - First commit: `1.8.8` → `1.8.9-rc.1` (patch bump + RC)
  - Second commit: `1.8.9-rc.1` → `1.8.9-rc.2` (increment RC only)

**Important Notes:**

- RC versions are development versions and should be used during issue work
- When issue is complete and merged to main, the final version should remove the `-rc.X` suffix
- Always commit version changes alongside code changes
- Use consistent commit message format: `chore: bump to X.Y.Z-rc.N`

### Pull Request Best Practices

When working on GitHub issues and creating pull requests, follow these practices to ensure proper issue tracking and closure:

#### Linking Issues to PRs

**ALWAYS** include a closing keyword in the PR description to automatically close the associated issue when the PR is merged. GitHub recognizes several keywords that will trigger automatic issue closure:

**Closing Keywords:**

- `Closes #123`
- `Fixes #123`
- `Resolves #123`

**Best Practices:**

1. **Include the closing keyword at the beginning of the PR description** for visibility
2. Use `Closes #123` format where `123` is the issue number you are working on
3. If working on multiple issues, include multiple closing keywords (e.g., `Closes #123, Closes #456`)
4. The closing keyword must be in the PR description (not just commit messages) to trigger automatic closure
5. Ensure the issue number is correct before submitting the PR

**Example PR Description:**

```
Closes #42

- [x] Add feature X
- [x] Update documentation
- [x] Add tests
- [x] Verify changes
```

This will automatically close issue #42 when the PR is merged to the default branch.

**Note:** If you're working on an issue but don't want it to close automatically (e.g., partial work, related but separate), use "Related to #123" or "Part of #123" instead.

## Troubleshooting

### Common Issues

- **Build hanging**: Builds complete in 15 seconds - wait with proper timeout, don't cancel
- **Dev server not starting**: Ensure dependencies are installed with `pnpm install` first
- **Linting failures**: Run `pnpm lint` to see specific issues, most are auto-fixable
- **Version dialog**: Normal on first load, click OK to dismiss

### Environment Limitations

- Docker builds fail in sandboxed environments due to certificate chain issues
- Application data stored in IndexedDB with client-side encryption (no backend database)

### Performance Notes

- Initial JavaScript bundle is large (736KB) but loads quickly with modern browsers
- Vite provides excellent development experience with fast refresh
- Production builds are optimized and minified

## Quick Commands Reference

| Task    | Command        | Time    | Timeout |
| ------- | -------------- | ------- | ------- |
| Install | `pnpm install` | 40s     | 90s+    |
| Lint    | `pnpm lint`    | 2s      | 30s     |
| Test    | `pnpm test`    | 5s      | 30s     |
| Build   | `pnpm build`   | 15s     | 60s+    |
| Dev     | `pnpm dev`     | instant | N/A     |
| Preview | `pnpm preview` | instant | N/A     |

**CRITICAL**: Always use adequate timeouts for build commands. NEVER CANCEL builds or long-running processes.
