# Quick Reference: Database Migrations

## 🚀 Quick Start

### Create New Migration

```bash
# Windows
scripts\new-migration.bat add_feature_name

# Linux/Mac
./scripts/new-migration.sh add_feature_name
```

### Test Migration Locally

```bash
# Reset and apply all migrations
npm run db:reset
npm run db:push

# Check migration status
npm run db:migrate
```

### Deploy to Production

```bash
# Commit and push (GitHub Actions will handle deployment)
git add supabase/migrations/
git commit -m "migration: add feature name"
git push origin main
```

## 📝 Common Migration Patterns

### Add Table

```sql
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_name_user_id
  ON public.table_name(user_id);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own records" ON public.table_name
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
```

### Add Column

```sql
ALTER TABLE public.table_name
ADD COLUMN IF NOT EXISTS new_column TEXT;

CREATE INDEX IF NOT EXISTS idx_table_name_new_column
  ON public.table_name(new_column);
```

### Update RLS Policy

```sql
DROP POLICY IF EXISTS "old_policy" ON public.table_name;

CREATE POLICY "new_policy" ON public.table_name
  FOR ALL USING (auth.uid() = user_id);
```

## 🔧 Available Commands

| Command                       | Description                   |
| ----------------------------- | ----------------------------- |
| `npm run db:reset`            | Reset database to clean state |
| `npm run db:push`             | Apply all migrations          |
| `npm run db:migrate`          | List applied migrations       |
| `npm run db:new feature_name` | Create new migration file     |
| `npm run db:status`           | Check for schema differences  |

## 📚 Documentation

- [MIGRATIONS.md](./MIGRATIONS.md) - Complete migration guide
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - CI/CD setup
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase configuration

## ✅ Pre-commit Checklist

Before pushing migrations:

- [ ] Migration file created with descriptive name
- [ ] SQL uses IF EXISTS/IF NOT EXISTS (idempotent)
- [ ] Tested locally: `npm run db:reset && npm run db:push`
- [ ] TypeScript types updated if schema changed
- [ ] RLS policies added for new tables
- [ ] Indexes added for queried columns
- [ ] Committed with clear message

## 🐛 Troubleshooting

### Migration fails locally

```bash
# Check Supabase CLI is installed
supabase --version

# If not installed:
# Windows: scoop install supabase
# macOS/Linux: brew install supabase/tap/supabase
# Or download from: https://github.com/supabase/cli/releases

# Re-link to project
supabase link --project-ref YOUR_PROJECT_ID

# Try again
npm run db:reset && npm run db:push
```

### GitHub Actions fails

1. Check GitHub → Actions tab for error details
2. Verify secrets are set correctly:
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_DB_PASSWORD`
   - `SUPABASE_PROJECT_ID`
3. Test migration locally first

### Already applied error

This is normal if you manually ran the migration. Either:

- Delete from `supabase_migrations.schema_migrations` table
- Or create a new migration to fix/update

---

**Need help?** Check [MIGRATIONS.md](./MIGRATIONS.md) for detailed examples!
