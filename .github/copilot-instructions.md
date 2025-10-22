# Portfolio Tracker - Copilot Instructions

## Project Overview

Indian Portfolio Tracker with Next.js 14+, Supabase, and Python NSE data integration.

## Completed Steps

- ✅ Verify copilot-instructions.md file creation
- ✅ Clarify Project Requirements
- ✅ Scaffold the Project
- ✅ Customize the Project
- ✅ Install Required Extensions (None needed)
- ✅ Compile the Project (TypeScript check passed)
- ✅ Create and Run Task
- ✅ Launch the Project
- ✅ Ensure Documentation is Complete
- ✅ Implement Authentication System
- ✅ Build Profile Management
- ✅ Setup Auto-formatting on Save
- ✅ Database Schema with RLS Policies
- ✅ GitHub Actions for Automated Migrations

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Data Fetching**: Python scripts for live NSE data
- **Database**: Version-controlled migrations via Supabase CLI
- **CI/CD**: GitHub Actions for automated deployments
- **Asset Types**: Indian Stocks, Mutual Funds, ETFs, FDs, NPS, EPFO, Real Estate

## Key Features

- Multi-user family portfolio management
- Live NSE data integration
- Track multiple investment types
- Member-wise and consolidated views
- Real-time portfolio valuation
- Automated database migrations

## Development Guidelines

- Use TypeScript for type safety
- Follow Next.js 14+ App Router patterns
- Implement Supabase Row Level Security (RLS)
- Use server actions for data mutations
- Keep Python scripts in separate /scripts folder
- **Database Changes**: Always create migrations, never modify schema.sql directly
- **Migration Pattern**: Use `npm run db:new feature_name` for new migrations
- **Testing**: Run `npm run db:reset && npm run db:push` before committing migrations
- **Auto-format**: Enabled on save via Prettier + Tailwind plugin

## Migration Workflow

1. Create migration: `scripts\new-migration.bat feature_name`
2. Edit migration file in `supabase/migrations/`
3. Test locally: `npm run db:reset && npm run db:push`
4. Update TypeScript types if schema changed
5. Commit and push - GitHub Actions handles deployment
6. Verify in GitHub Actions tab

## Important Files

- `supabase/migrations/` - Version-controlled database migrations
- `supabase/schema.sql` - Current complete schema (reference only, don't edit)
- `MIGRATIONS.md` - Complete migration guide and best practices
- `src/types/database.types.ts` - TypeScript types for database
- `.github/workflows/supabase-migrations.yml` - Automated deployment workflow
