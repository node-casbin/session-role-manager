# CI/CD Setup

This repository uses GitHub Actions for continuous integration and automated releases.

## Workflows

### CI Workflow (.github/workflows/ci.yml)

Runs on every push and pull request to the `master` branch:

- **Lint**: Checks code formatting with Prettier
- **Test**: Runs tests on Node.js versions 18 and 20
- **Build**: Compiles TypeScript to JavaScript

### Release Workflow (.github/workflows/release.yml)

Runs on every push to the `master` branch after PR merge:

- Runs lint, test, and build
- Uses [semantic-release](https://github.com/semantic-release/semantic-release) to:
  - Analyze commit messages to determine version bump
  - Generate changelog
  - Publish to npm
  - Create GitHub release

## Semantic Release Configuration

The project uses conventional commits to determine version bumps:

- `fix:` - patch release (0.0.x)
- `feat:` - minor release (0.x.0)
- `BREAKING CHANGE:` - major release (x.0.0)

Configuration is in `.releaserc.json`.

## Required Secrets

For the release workflow to work, the following GitHub secrets must be configured:

### NPM_TOKEN

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click on your profile → Access Tokens
3. Generate a new token with "Automation" type
4. Add the token as `NPM_TOKEN` in repository secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: (paste your npm token)

### GITHUB_TOKEN

This is automatically provided by GitHub Actions, no configuration needed.

## Testing Locally

To test the build and release process locally:

```bash
# Install dependencies
yarn install

# Run linter
yarn run lint

# Run tests
yarn run test

# Build the project
yarn run build

# Test semantic-release (dry-run)
npx semantic-release --dry-run
```

## Commit Message Format

Please use [conventional commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: update documentation
chore: update dependencies
```

Examples:

```
feat: add session timeout configuration
fix: resolve memory leak in role manager
docs: update installation instructions
```
