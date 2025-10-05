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
4. **Version Display**: Check that version number appears in top-right (update this when version changes)

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
- **ALWAYS increment the patch version in package.json when making bug fixes or small changes**
- **ALWAYS increment the minor version when adding new features**
- **ALWAYS increment the major version for breaking changes**
- Update version with `npm version <major|minor|patch>` to auto-update package.json
- CI/CD uses version for deployment tagging
- When fixing bugs or issues, increment the patch version (e.g., 1.8.5 → 1.8.6)

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
