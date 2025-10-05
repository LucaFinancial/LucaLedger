# Luca Ledger - GitHub Copilot Instructions

Luca Ledger is a React-based personal finance management application for tracking expenses across multiple account types (Checking, Savings, Credit Card). Built with React 18.2, Vite, Material-UI, Redux Toolkit, and React Router.

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Development Setup

- **Install dependencies**: `yarn install` -- takes 40 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
- **Development server**: `yarn dev` -- starts Vite dev server on http://localhost:5173
- **Production build**: `yarn build` -- takes 15 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- **Preview production build**: `yarn preview` -- serves built files on http://localhost:4173
- **Code quality**: `yarn lint` -- runs ESLint, takes 2 seconds

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

1. **Navigation**: Test navigation between Dashboard (/) and Accounts (/accounts)
2. **Account Creation**: Click "Create New Account" button to verify account creation works
3. **UI Responsiveness**: Verify Material-UI components render correctly
4. **Version Display**: Check that version number (currently v1.8.2) appears in top-right

### Code Quality Requirements

- **ALWAYS** run `yarn lint` before completing changes - CI will fail otherwise
- ESLint configuration enforces React, accessibility, and import standards
- Prettier formatting is integrated with ESLint
- No test suite exists - manual validation required

### CI/CD Validation

- GitHub Actions automatically builds and deploys to GitHub Pages on push to main
- Actions use Node.js 20 and yarn for builds
- Build artifacts are deployed to GitHub Pages at the configured domain

## Application Architecture

### Key Technologies

- **React 18.2**: Main UI framework with modern hooks
- **Vite 4.5**: Build tool and dev server for fast development
- **Material-UI 5.14**: Component library for consistent UI
- **Redux Toolkit 1.9**: State management for accounts and transactions
- **React Router 6.17**: Client-side routing
- **Day.js**: Date manipulation library

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── MainLayout/      # App header, navigation, layout
│   ├── VersionDisplay/  # Version number display
│   └── [15 other components]
├── views/               # Main application pages
│   ├── Dashboard/       # Financial overview (home page)
│   ├── Accounts/        # Account management
│   ├── Ledger/         # Transaction ledger
│   └── Categories/      # Category management
├── store/              # Redux store and slices
│   ├── accounts/       # Account state management
│   └── transactions/   # Transaction state management
├── hooks/              # Custom React hooks
└── main.jsx           # Application entry point
```

### Important Files

- `package.json`: Dependencies, scripts, version number
- `vite.config.js`: Build configuration with @ alias for src/
- `.eslintrc`: Code quality rules and React-specific linting
- `Dockerfile`: Multi-stage build (note: fails in sandboxed environments due to cert issues)
- `UserGuide.pdf`: 2.4MB user documentation

## Common Tasks

### Dependency Management

- Uses yarn 1.22.22+ as package manager (defined in package.json)
- Dependencies are locked with yarn.lock
- Install new packages with `yarn add <package>`
- Development dependencies with `yarn add -D <package>`

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

#### Automatic RC Versioning for Non-Main Branches

- On non-main branches (e.g., `copilot/*` branches), GitHub Actions automatically appends `-rc.X` suffix
- Each push to the branch automatically increments the RC number (e.g., `1.8.9-rc.1` → `1.8.9-rc.2`)
- The RC version workflow:
  1. Detects the base version from package.json
  2. Finds the highest existing RC tag for that base version
  3. Increments the RC number and updates package.json
  4. Commits with message format: `chore: bump to X.Y.Z-rc.N`
  5. Creates and pushes a git tag for the RC version
- **Manual version updates on feature branches**: If you manually update the base version (e.g., from 1.8.8 to 1.8.9), the next automated run will start at `1.8.9-rc.1`
- **Main branch**: No RC suffix is added; versions remain as standard semantic versions

#### Semantic Versioning Guidelines

Luca Ledger follows [Semantic Versioning 2.0.0](https://semver.org/) with the format MAJOR.MINOR.PATCH:

**MAJOR version** (X.0.0) - Increment when making incompatible changes:
- Breaking changes to data structure (e.g., account schema changes that require migration)
- Removing features or components
- Changing APIs that affect saved account files
- Changes that require users to take action (e.g., clear localStorage)
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

**For main branch (production releases):**

1. **Before making changes**: Check current version in package.json
2. **After completing changes**: Determine the appropriate version increment based on the guidelines above
3. **Update version**: Run `npm version <major|minor|patch>` from the repository root
4. **Verify**: Check that package.json has been updated correctly
5. **Commit**: Include the version change in your commit

**For feature/copilot branches (release candidates):**

1. **Automatic RC versioning**: The RC version bump workflow handles versioning automatically on each push
2. **Manual base version update**: If you want to change the base version (e.g., from 1.8.8 to 1.9.0), run `npm version <major|minor|patch>` and commit
3. **Next automated run**: The workflow will detect the new base version and start the RC sequence at `X.Y.Z-rc.1`
4. **No manual RC updates needed**: The workflow manages the RC number incrementing automatically

#### Examples

- Adding a new "Investment Account" type → **MINOR** version bump (new feature)
- Fixing a bug where dates display incorrectly → **PATCH** version bump (bug fix)
- Changing the account data schema in a breaking way → **MAJOR** version bump (breaking change)
- Improving button styling → **PATCH** version bump (UI improvement)
- Adding export to PDF feature → **MINOR** version bump (new feature)
- Updating Material-UI from 5.14 to 5.15 → **PATCH** version bump (dependency update)
- Removing support for old account format → **MAJOR** version bump (breaking change)

## Troubleshooting

### Common Issues

- **Build hanging**: Builds complete in 15 seconds - wait with proper timeout, don't cancel
- **Dev server not starting**: Ensure dependencies are installed with `yarn install` first
- **Linting failures**: Run `yarn lint` to see specific issues, most are auto-fixable
- **Version dialog**: Normal on first load, click OK to dismiss

### Environment Limitations

- Docker builds fail in sandboxed environments due to certificate chain issues
- No automated test suite exists - rely on manual validation
- Application data stored in browser localStorage (no backend database)

### Performance Notes

- Initial JavaScript bundle is large (736KB) but loads quickly with modern browsers
- Vite provides excellent development experience with fast refresh
- Production builds are optimized and minified

## Quick Commands Reference

| Task    | Command        | Time    | Timeout |
| ------- | -------------- | ------- | ------- |
| Install | `yarn install` | 40s     | 90s+    |
| Lint    | `yarn lint`    | 2s      | 30s     |
| Build   | `yarn build`   | 15s     | 60s+    |
| Dev     | `yarn dev`     | instant | N/A     |
| Preview | `yarn preview` | instant | N/A     |

**CRITICAL**: Always use adequate timeouts for build commands. NEVER CANCEL builds or long-running processes.
