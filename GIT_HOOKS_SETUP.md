# Git Hooks Setup with Husky

Automated pre-push validation using Husky to prevent broken code from reaching the remote repository.

## What's Installed

- **Husky**: Git hooks manager
- **Pre-push hook**: Automatically runs before every `git push`

## Pre-Push Checks

Every time you run `git push`, these checks run automatically:

1. **Type Check** (`npm run type-check`)
   - Validates TypeScript types
   - Catches type errors

2. **Build Check** (`npm run build`)
   - Compiles the Next.js application
   - Catches syntax errors, missing imports, runtime issues

3. **Format Check** (`npm run format:check`)
   - Ensures code follows Prettier formatting rules
   - Run `npm run format` to fix issues

## How It Works

```bash
# When you push...
git push origin main

# Husky automatically runs:
# 🔍 Running pre-push checks...
# 📝 Type checking...
# 🏗️ Building project...
# 💅 Checking formatting...
# ✅ All pre-push checks passed!

# If any check fails, push is blocked
```

## If Checks Fail

### Type Check Failed

```bash
❌ Type check failed. Fix TypeScript errors before pushing.
```

**Solution**: Fix TypeScript errors in your code, then try pushing again.

### Build Failed

```bash
❌ Build failed. Fix build errors before pushing.
```

**Solution**: Fix syntax errors, missing imports, or configuration issues, then try pushing again.

### Format Check Failed

```bash
⚠️ Formatting issues found. Run 'npm run format' to fix.
```

**Solution**: Run `npm run format` to auto-format your code, then try pushing again.

## Bypassing Hooks (Not Recommended)

Only use this in emergencies:

```bash
git push --no-verify
```

**⚠️ Warning**: Bypassing hooks can push broken code and fail GitHub Actions deployment.

## Manual Testing

Test the pre-push hook without actually pushing:

```bash
# Run all checks manually
npm run type-check && npm run build && npm run format:check
```

## Workflow

```bash
# 1. Make changes
git add .
git commit -m "feat: add new feature"

# 2. Push (hooks run automatically)
git push origin main

# 3. If hooks pass, code is pushed
# 4. GitHub Actions runs migrations
```

## Benefits

✅ **Prevents broken deployments**: Catches errors before they reach remote
✅ **Saves time**: No waiting for GitHub Actions to fail
✅ **Enforces quality**: Ensures all code passes type/build/format checks
✅ **Automatic**: No need to remember manual checks

## Files

- `.husky/pre-push` - Pre-push hook script
- `package.json` - Contains `"prepare": "husky"` script

## Uninstalling

If you want to remove Husky:

```bash
npm uninstall husky
rm -rf .husky
```

Remove `"prepare": "husky"` from `package.json` scripts.
