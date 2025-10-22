# GitHub Actions Setup for Supabase Migrations

## Quick Setup Guide

Follow these steps to enable automated database migrations via GitHub Actions.

## Prerequisites

- GitHub repository created and code pushed
- Supabase project created at https://app.supabase.com

## Step 1: Get Supabase Credentials

### 1.1 Get Access Token

1. Go to https://app.supabase.com/account/tokens
2. Click **Generate new token**
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token (you won't see it again!)

### 1.2 Get Project ID

1. Go to your Supabase project dashboard
2. Look at the URL: `https://app.supabase.com/project/[PROJECT_ID]`
3. Copy the `[PROJECT_ID]` part

### 1.3 Get Database Password

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find your database password (or reset it if needed)
3. Copy the password

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

   | Secret Name             | Value                                | Description                |
   | ----------------------- | ------------------------------------ | -------------------------- |
   | `SUPABASE_ACCESS_TOKEN` | Your access token from step 1.1      | API token for Supabase CLI |
   | `SUPABASE_DB_PASSWORD`  | Your database password from step 1.3 | Database password          |
   | `SUPABASE_PROJECT_ID`   | Your project ID from step 1.2        | Supabase project reference |

## Step 3: Verify Setup

### 3.1 Check Workflow File

The workflow file already exists at `.github/workflows/supabase-migrations.yml`

```yaml
name: Supabase Database Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'
  workflow_dispatch:
```

### 3.2 Test the Workflow

**Option A: Manual Trigger**

1. Go to GitHub → **Actions** tab
2. Select "Supabase Database Migrations" workflow
3. Click **Run workflow** → **Run workflow**
4. Watch the workflow execute

**Option B: Create a Test Migration**

```bash
# Create a test migration
scripts\new-migration.bat test_github_actions

# Edit the file and add a simple comment
# File: supabase/migrations/[timestamp]_test_github_actions.sql
-- This is a test migration for GitHub Actions

# Commit and push
git add supabase/migrations/
git commit -m "test: verify GitHub Actions migration workflow"
git push origin main
```

5. Go to GitHub → **Actions** tab
6. Watch the workflow run automatically

## Step 4: Verify Migration Applied

1. Go to Supabase dashboard → **SQL Editor**
2. Run this query:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations
   ORDER BY version DESC
   LIMIT 5;
   ```
3. Verify your migration appears in the list

## Workflow Triggers

The GitHub Actions workflow runs when:

1. **Push to main** - Any changes to `supabase/migrations/**` files
2. **Pull Request** - Validates migrations without applying them
3. **Manual trigger** - Via GitHub Actions UI

## Common Issues

### ❌ "Permission denied"

**Solution**: Check that `SUPABASE_ACCESS_TOKEN` is correctly set in GitHub Secrets

### ❌ "Project not found"

**Solution**: Verify `SUPABASE_PROJECT_ID` matches your project ID exactly

### ❌ "Authentication failed"

**Solution**: Check `SUPABASE_DB_PASSWORD` is correct

### ❌ "Migration already applied"

**Solution**: This is normal if you manually applied the migration before. Delete it from Supabase and re-run.

## Local Development

Before pushing migrations, always test locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref YOUR_PROJECT_ID

# Test migrations
npm run db:reset
npm run db:push

# Check status
npm run db:migrate
```

## Migration Workflow

1. **Create migration**: `scripts\new-migration.bat feature_name`
2. **Edit migration**: Add your SQL in `supabase/migrations/[timestamp]_feature_name.sql`
3. **Test locally**: `npm run db:reset && npm run db:push`
4. **Commit**: `git add supabase/migrations/ && git commit -m "migration: feature_name"`
5. **Push**: `git push origin main`
6. **Verify**: Check GitHub Actions tab for success ✅

## Security Notes

- ✅ GitHub Secrets are encrypted and not visible in logs
- ✅ Only users with repo write access can trigger workflows
- ✅ Access tokens can be revoked anytime from Supabase dashboard
- ✅ Database password can be rotated in Supabase settings

## Next Steps

- See [MIGRATIONS.md](./MIGRATIONS.md) for detailed migration patterns
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for Supabase configuration
- Review [README.md](./README.md) for general project setup

---

**Pro Tip**: Set up branch protection rules in GitHub to require CI checks before merging to main!
