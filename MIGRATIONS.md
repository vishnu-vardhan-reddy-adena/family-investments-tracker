# Database Migration Guide

## Overview

This project uses version-controlled database migrations for Supabase. All database changes are tracked in the `supabase/migrations/` directory and automatically deployed via GitHub Actions.

## Migration System

### Directory Structure

```
supabase/
├── migrations/           # Version-controlled migration files
│   ├── 20251022000000_initial_schema.sql
│   ├── 20251022000001_add_user_preferences.sql
│   └── ...
├── schema.sql           # Complete current schema (reference only)
└── config.toml          # Supabase project configuration
```

## Creating New Migrations

### Method 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**

   **Windows (PowerShell):**

   ```powershell
   # Using Scoop
   scoop install supabase

   # Or download from GitHub releases
   # https://github.com/supabase/cli/releases
   ```

   **macOS:**

   ```bash
   brew install supabase/tap/supabase
   ```

   **Linux:**

   ```bash
   # Using Homebrew
   brew install supabase/tap/supabase

   # Or download from GitHub releases
   curl -Lo supabase.tar.gz https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz
   tar -xzf supabase.tar.gz
   sudo mv supabase /usr/local/bin/supabase
   ```

   **Verify installation:**

   ```bash
   supabase --version
   ```

2. **Initialize Supabase (First time only)**

   ```bash
   supabase init
   ```

3. **Link to your project**

   ```bash
   supabase link --project-ref your-project-id
   ```

4. **Create a new migration**

   ```bash
   supabase migration new add_feature_name
   ```

   This creates a file like: `supabase/migrations/20251022123456_add_feature_name.sql`

5. **Write your migration SQL**

   ```sql
   -- Add new column
   ALTER TABLE public.profiles ADD COLUMN bio TEXT;

   -- Add index
   CREATE INDEX idx_profiles_bio ON public.profiles(bio);

   -- Update RLS policy
   DROP POLICY IF EXISTS "policy_name" ON public.profiles;
   CREATE POLICY "policy_name" ON public.profiles
     FOR SELECT USING (auth.uid() = id);
   ```

6. **Test locally**

   ```bash
   supabase db reset  # Reset to clean state
   supabase db push   # Apply all migrations
   ```

7. **Commit and push**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add bio field to profiles"
   git push
   ```

### Method 2: Manual Migration Files

1. **Create migration file**

   ```bash
   # Format: YYYYMMDDHHMMSS_description.sql
   touch supabase/migrations/20251022120000_add_bio_field.sql
   ```

2. **Write idempotent SQL**

   ```sql
   -- Always use IF EXISTS / IF NOT EXISTS for idempotency

   -- Add column
   ALTER TABLE public.profiles
   ADD COLUMN IF NOT EXISTS bio TEXT;

   -- Add table
   CREATE TABLE IF NOT EXISTS public.new_table (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name TEXT NOT NULL
   );

   -- Add enum value (requires special handling)
   DO $$ BEGIN
     ALTER TYPE investment_type ADD VALUE IF NOT EXISTS 'crypto';
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;
   ```

3. **Test and commit**
   ```bash
   supabase db reset
   supabase db push
   git add . && git commit -m "migration: add bio field"
   ```

## Automated Deployment (GitHub Actions)

### Setup

1. **Add GitHub Secrets**

   Go to GitHub repo → Settings → Secrets and variables → Actions

   Add these secrets:

   ```
   SUPABASE_ACCESS_TOKEN    - From Supabase Dashboard → Settings → API
   SUPABASE_DB_PASSWORD     - Your database password
   SUPABASE_PROJECT_ID      - From project URL: https://app.supabase.com/project/[PROJECT_ID]
   ```

2. **Get Access Token**
   - Go to https://app.supabase.com/account/tokens
   - Generate a new token
   - Copy and add to GitHub Secrets

### How It Works

When you push migrations to `main` branch:

1. GitHub Actions workflow triggers
2. Checks out your code
3. Installs Supabase CLI
4. Links to your Supabase project
5. Runs `supabase db push` to apply migrations
6. Verifies migration status

### Workflow Files

- `.github/workflows/supabase-migrations.yml` - Main migration workflow
- Triggers on:
  - Push to `main` branch (migrations folder changes)
  - Pull requests (validation only)
  - Manual trigger via GitHub UI

## Migration Best Practices

### ✅ DO

1. **Make migrations idempotent**

   ```sql
   CREATE TABLE IF NOT EXISTS ...
   ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
   DROP POLICY IF EXISTS ...
   ```

2. **Use transactions for multiple operations**

   ```sql
   BEGIN;
     -- Multiple operations
     ALTER TABLE ...;
     CREATE INDEX ...;
   COMMIT;
   ```

3. **Add descriptive names**

   ```
   ✅ 20251022120000_add_user_bio_field.sql
   ❌ 20251022120000_update.sql
   ```

4. **Test migrations locally first**

   ```bash
   supabase db reset
   supabase db push
   ```

5. **Handle enum additions carefully**
   ```sql
   DO $$ BEGIN
     ALTER TYPE my_enum ADD VALUE IF NOT EXISTS 'new_value';
   EXCEPTION
     WHEN duplicate_object THEN NULL;
   END $$;
   ```

### ❌ DON'T

1. **Don't delete old migration files** - They're part of history
2. **Don't modify existing migrations** - Create new ones instead
3. **Don't use DROP TABLE without backup** - Be cautious
4. **Don't skip testing** - Always test locally first
5. **Don't hardcode values** - Use variables when possible

## Common Migration Patterns

### Add a New Table

```sql
-- Migration: 20251022120000_add_notifications_table.sql

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
```

### Add a Storage Bucket

```sql
-- Migration: 20251022120001_add_documents_bucket.sql

-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- private bucket
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Add RLS policies for storage
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Add a Column

```sql
-- Migration: 20251022120002_add_profile_bio.sql

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_bio
  ON public.profiles USING gin(to_tsvector('english', bio))
  WHERE bio IS NOT NULL;
```

### Modify RLS Policy

```sql
-- Migration: 20251022120002_update_portfolio_policy.sql

DROP POLICY IF EXISTS "Users can view own portfolios" ON public.portfolios;

CREATE POLICY "Users can view own portfolios" ON public.portfolios
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.id = portfolios.family_member_id
      AND family_members.user_id = auth.uid()
    )
  );
```

### Add a Function

```sql
-- Migration: 20251022120003_add_portfolio_stats_function.sql

CREATE OR REPLACE FUNCTION public.get_portfolio_stats(p_portfolio_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_value', SUM(quantity * COALESCE(current_price, purchase_price)),
    'total_invested', SUM(quantity * purchase_price),
    'count', COUNT(*)
  ) INTO result
  FROM public.investments
  WHERE portfolio_id = p_portfolio_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

## Rollback Strategy

### Option 1: Create Rollback Migration

```sql
-- Migration: 20251022120004_rollback_bio_field.sql

ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;
DROP INDEX IF EXISTS idx_profiles_bio;
```

### Option 2: Database Backup

Supabase automatically backs up your database. To restore:

1. Go to Supabase Dashboard → Database → Backups
2. Select backup point
3. Click Restore

## Local Development Workflow

```bash
# 1. Install Supabase CLI (one time)
# See installation instructions above

# 2. Link to your project (one time)
supabase link --project-ref YOUR_PROJECT_ID

# 3. Create migration
supabase migration new my_feature

# 4. Edit the migration file
code supabase/migrations/[timestamp]_my_feature.sql

# 5. Test migration
supabase db push

# 6. Test in local app
npm run dev

# 7. Reset if needed (reapplies all migrations from scratch)
supabase db reset

# 8. Commit when ready
git add supabase/migrations/
git commit -m "feat: add my feature"
git push
```

## Troubleshooting

### Migration Failed in GitHub Actions

1. Check the Actions tab for error details
2. Test migration locally:
   ```bash
   supabase db reset
   supabase db push
   ```
3. Fix issues and push again

### Conflict Between Migrations

1. Pull latest migrations:
   ```bash
   git pull origin main
   ```
2. Create new migration with fix:
   ```bash
   supabase migration new fix_conflict
   ```
3. Apply and test

### Reset Everything

```bash
# Local
supabase db reset

# Production (CAREFUL!)
# 1. Backup first in Supabase Dashboard
# 2. Manually run migrations in SQL Editor
```

## Migration Checklist

Before pushing to production:

- [ ] Migration file follows naming convention
- [ ] SQL is idempotent (uses IF EXISTS/IF NOT EXISTS)
- [ ] Tested locally with `supabase db reset && supabase db push`
- [ ] **Build check passes:** `npm run build` ✨ **IMPORTANT!**
- [ ] **Type check passes:** `npm run type-check`
- [ ] **Code formatted:** `npm run format`
- [ ] TypeScript types updated in `src/types/database.types.ts`
- [ ] API routes updated if schema changed
- [ ] RLS policies tested
- [ ] Indexes added for new queries
- [ ] Migration documented in commit message
- [ ] Reviewed by team (if applicable)

### Pre-Push Command Sequence

Always run these commands before pushing:

```bash
# 1. Test migration locally
npm run db:reset && npm run db:push

# 2. Type check
npm run type-check

# 3. Build check (catches runtime errors!)
npm run build

# 4. Format code
npm run format

# 5. If all pass, commit and push
git add .
git commit -m "migration: your feature name"
git push origin main
```

⚠️ **Critical:** Always run `npm run build` before pushing! This catches:

- TypeScript errors
- Missing imports
- Invalid syntax
- Runtime issues

## GitHub Actions Status

Check migration status:

1. Go to GitHub repo → Actions
2. Find "Supabase Database Migrations" workflow
3. Check latest run status

---

**Pro Tip:** Always run `supabase db reset && supabase db push` locally before pushing to ensure migrations work from scratch!
