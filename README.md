# Luca Ledger

Luca Ledger is a client-side personal finance manager built with React, Vite, and Material UI. It keeps checking, savings, and credit card accounts in sync, encrypts all sensitive data in the browser, and deploys as a static site on GitHub Pages—no backend required.

## Why Luca Ledger?
- **Multi-account coverage:** Track deposits, withdrawals, and statement cycles across checking, savings, and credit cards.
- **Client-side encryption:** AES-256-GCM with PBKDF2-derived keys keeps data local and secure in IndexedDB via Dexie.
- **Session-aware auth:** Password-derived keys gate every session; there is no password recovery, by design.
- **Rich UI + insights:** Material-UI, D3/Recharts visualizations, and Redux selectors provide responsive charts and ledgers.
- **Offline-first:** All logic runs locally, so the app works even without a network connection after first load.

## Tech Stack
- React 18.2 with hooks and context
- Vite 4.x for dev/prod builds
- Material UI 5.x + Emotion for theming
- Redux Toolkit for state + encrypted middleware
- Dexie (IndexedDB) for encrypted persistence
- Day.js/Date-fns and D3/Recharts for date math and charts
- Vitest + Testing Library + jsdom for tests

## Architecture Highlights
### Encryption Pipeline
1. Password → PBKDF2 (100k iterations, SHA-256) → Key Wrapping Key (KWK)
2. KWK unwraps a Data Encryption Key (DEK)
3. Each record is encrypted with AES-256-GCM + unique IV before storage in IndexedDB
4. Session tokens (3 days) store wrapped DEKs; exports remain unencrypted and must be protected manually

See `ENCRYPTION.md` and `src/crypto/` for implementation details.

### Authentication Flow
- Auth states: `loading`, `no-users`, `login`, `authenticated`, `legacy-migration`
- Users authenticate via username + password; legacy plaintext data migrates automatically
- Sessions live in `sessionStorage` and expire after 72 hours

### Application Layout
- React Router (`/dashboard`, `/accounts`, `/ledger`, `/categories`, `/settings`, `/help`, `/`) drives navigation
- `src/components/MainLayout` renders global navigation + version banner
- Redux slices live under `src/store/*` (accounts, transactions, categories, statements, encryption)

## Project Structure
```
src/
├── components/        # UI modules (auth, ledger, analytics, layout, modals)
├── views/             # Route-level pages (Dashboard, Accounts, Ledger, etc.)
├── store/             # Redux Toolkit slices, encrypted middleware, selectors
├── auth/              # Auth context + provider
├── crypto/            # AES/PBKDF2 helpers and key manager
├── validation/        # Zod/AJV schemas + validation helpers
├── hooks/             # Custom React hooks (balances, statements, etc.)
└── __tests__/         # Vitest suites, fixtures, utilities
```

## Getting Started
### Prerequisites
- Node.js 20+
- Yarn 1.22 (classic)

### Installation
```bash
git clone https://github.com/LucaFinancial/LucaLedger.git
cd LucaLedger
yarn install   # ~40 seconds; do not interrupt
```

### Development Workflow
| Command | Purpose | Notes |
| --- | --- | --- |
| `yarn dev` | Start Vite dev server (http://localhost:5173) | Hot reload + fast refresh |
| `yarn build` | Production build to `dist/` | ~15 s; copies CNAME + 404 on GH Pages build |
| `yarn preview` | Serve built assets locally | Useful for final QA |
| `yarn lint` | ESLint with React/A11y rules | Required before pushing |
| `yarn test` | Vitest suite (headless) | Use `yarn test:watch` while developing |

## Manual QA Checklist
Run these steps after significant UI changes:
1. Navigate between Dashboard (`/dashboard`) and Accounts (`/accounts`)
2. Create an account via "Create New Account" button and verify form validation
3. Confirm Material-UI components render responsively on mobile + desktop widths
4. Ensure the header shows the semantic app version (format `vX.Y.Z`) and the update dialog dismisses

## Testing & Linting
- Unit + integration tests live under `src/__tests__/`
- Use `yarn test:coverage` for v8 instrumentation reports
- Fake IndexedDB + jsdom handle crypto + Dexie flows in tests
- ESLint + Prettier rules enforce single quotes, 2 spaces, `@/` import aliases, and a11y checks

## Versioning & Release Flow
Luca Ledger follows Semantic Versioning (MAJOR.MINOR.PATCH) with RC suffixes during issue development.

1. **Determine bump type**
	- Major: breaking schema or removal of features
	- Minor: new features, UX enhancements, noticeable perf gains
	- Patch: bug fixes, refactors, docs, dependency bumps
2. **Apply RC suffix while iterating**
	- First commit on an issue: `npm version <major|minor|patch> --preid=rc --no-git-tag-version` → results in `X.Y.Z-rc.1`
	- Increment RC number on subsequent commits (`-rc.2`, `-rc.3`, ...)
3. **Final release**
	- Drop `-rc.*`, run `npm version <type>`
	- Ensure `package.json` version matches header display (`src/components/VersionDisplay`)

## Deployment
- Production builds are deployed via GitHub Actions to GitHub Pages at https://lucaledger.app/
- `yarn build:pages` handles the static-site artifacts (`CNAME`, `404.html`)
- `yarn deploy` uses `gh-pages` to publish the `dist/` directory manually if needed

## Troubleshooting
- **Build hangs?** Wait the full 15 seconds; do not cancel.
- **Dev server fails?** Ensure dependencies are installed and no other process uses port 5173.
- **Lint errors?** Run `yarn lint` for actionable rule hints; most issues are autofixable.
- **Encryption data loss?** Passwords cannot be recovered. Export data regularly and store encrypted backups externally.

## Contributing
1. Fork and branch from `main`
2. Follow the versioning flow above and include RC bumps in commits
3. Add or update tests + docs for every change
4. Link issues in PR descriptions using `Closes #<id>` so GitHub auto-closes them

## License
MIT © LucaFinancial
