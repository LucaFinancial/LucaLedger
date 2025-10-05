# Automatic RC Versioning for LucaLedger

## Overview

This document describes the automatic Release Candidate (RC) versioning system implemented for LucaLedger non-main branches.

## How It Works

### Workflow Trigger

The RC versioning workflow (`.github/workflows/rc-version-bump.yml`) automatically runs on every push to any branch **except** the `main` branch.

### Version Increment Logic

1. **Read Current Version**: The workflow reads the current version from `package.json`
2. **Extract Base Version**: Removes any existing `-rc.X` suffix to get the base semantic version
3. **Find Existing RC Tags**: Searches git tags for all RC versions of the current base version (e.g., `v1.8.8-rc.1`, `v1.8.8-rc.2`, etc.)
4. **Increment RC Number**: Finds the highest RC number and increments it by 1
5. **Update package.json**: Updates the version field with the new RC version
6. **Commit Changes**: Creates a commit with message format: `chore: bump to X.Y.Z-rc.N`
7. **Create Tag**: Creates and pushes a git tag for the new RC version (e.g., `v1.8.8-rc.2`)

### Example Flow

Initial state:
- Branch: `copilot/feature-branch`
- package.json version: `1.8.8`

First push:
- Workflow creates version `1.8.8-rc.1`
- Creates commit: `chore: bump to 1.8.8-rc.1`
- Creates tag: `v1.8.8-rc.1`

Second push:
- Workflow creates version `1.8.8-rc.2`
- Creates commit: `chore: bump to 1.8.8-rc.2`
- Creates tag: `v1.8.8-rc.2`

Third push:
- Workflow creates version `1.8.8-rc.3`
- Creates commit: `chore: bump to 1.8.8-rc.3`
- Creates tag: `v1.8.8-rc.3`

### Changing Base Version

If you manually update the base version (e.g., from `1.8.8` to `1.9.0`), the next workflow run will start the RC sequence at `1.9.0-rc.1`.

Example:
```bash
# Manually bump to next minor version
npm version minor

# Results in package.json having version "1.9.0"
# Next push will trigger workflow to create "1.9.0-rc.1"
```

## Version Display

The RC version is displayed in the application UI:
- Location: Top-right corner of the header
- Component: `src/components/VersionDisplay/VersionDisplay.jsx`
- Format: `vX.Y.Z-rc.N` (e.g., `v1.8.8-rc.2`)

The version update dialog also shows the RC version when users revisit the application.

## Workflow Configuration

### File Location
`.github/workflows/rc-version-bump.yml`

### Key Features
- **Runs on**: All branches except `main`
- **Permissions**: `contents: write` (required for commits and tags)
- **Node Version**: 20
- **Git Configuration**: Uses `github-actions[bot]` as committer

### Skip Logic
The workflow includes a check to skip updates if the version is already correct. This prevents unnecessary commits if the workflow is re-run.

## Benefits

1. **Automatic Versioning**: No manual version management required on feature branches
2. **Clear Progression**: Each push increments the RC number, making it easy to track progress
3. **Consistent Tags**: All RC versions are tagged for easy reference
4. **Standardized Commits**: All version bumps use the same commit message format
5. **Build Artifacts**: All builds reflect the correct RC version number

## Main Branch Behavior

The RC versioning workflow does **not** run on the `main` branch. Main branch uses standard semantic versioning without RC suffixes, managed through the existing release workflow (`.github/workflows/gh-tag-release.yml`).

## Testing

The workflow has been tested and verified to:
- ✅ Correctly detect the base version from package.json
- ✅ Find existing RC tags and determine the next RC number
- ✅ Update package.json with the new RC version
- ✅ Create commits with the standardized message format
- ✅ Create and push git tags for each RC version
- ✅ Increment from rc.1 → rc.2 → rc.3 correctly
- ✅ Work with the application build process
- ✅ Display correctly in the UI

## Troubleshooting

### Workflow Not Running
- Ensure you're not on the `main` branch
- Check GitHub Actions tab for workflow status
- Verify the workflow file exists at `.github/workflows/rc-version-bump.yml`

### Version Not Incrementing
- Check if the workflow has write permissions
- Verify GITHUB_TOKEN has access to create tags and push commits
- Review workflow logs in GitHub Actions

### Manual Override
If you need to manually set a specific RC version:
```bash
npm version 1.8.9-rc.5 --no-git-tag-version
git add package.json
git commit -m "chore: bump to 1.8.9-rc.5"
git push
```

The next automated run will detect this version and increment from there (to rc.6).
