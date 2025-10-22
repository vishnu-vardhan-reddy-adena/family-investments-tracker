# Supabase Setup Guide

This guide will walk you through setting up your Supabase project for the Portfolio Tracker application.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: Portfolio Tracker (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to you
   - **Pricing Plan**: Free tier is sufficient for personal use
5. Click **"Create new project"**
6. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - ⚠️ Keep this secret!

3. Create a `.env.local` file in your project root:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
   ```

## Step 3: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see a success message

This will create:

- All necessary tables (profiles, portfolios, investments, etc.)
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

## Step 4: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `profiles`
   - `family_members`
   - `portfolios`
   - `investments`
   - `transactions`
   - `market_data`
   - `mutual_fund_data`

## Step 5: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** authentication (enabled by default)
3. Optionally enable other providers:
   - Google
   - GitHub
   - etc.

### Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Step 6: Set Up Storage (Optional)

If you want to store user avatars or documents:

1. Go to **Storage**
2. Click **"Create a new bucket"**
3. Name it `avatars` or `documents`
4. Set it as **Public** or **Private** based on your needs
5. Configure storage policies as needed

## Step 7: Configure Row Level Security (RLS)

The schema file already includes RLS policies, but you can verify:

1. Go to **Authentication** → **Policies**
2. Select each table to see the policies
3. Policies ensure:
   - Users can only see their own data
   - Family members belong to the correct user
   - Market data is read-only for all users

## Step 8: Test the Connection

1. Back in your project, run:

   ```bash
   npm run dev
   ```

2. The app should connect to Supabase without errors

3. Check the browser console for any connection issues

## Database Backup

To backup your database:

1. Go to **Settings** → **Database**
2. Click **"Download backup"** under Point-in-time Recovery

## Useful Supabase Features

### Realtime Subscriptions

Enable realtime for tables that need live updates:

```typescript
const subscription = supabase
  .channel('investments')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, (payload) =>
    console.log(payload)
  )
  .subscribe();
```

### Database Functions

You can create PostgreSQL functions for complex queries:

```sql
CREATE OR REPLACE FUNCTION get_portfolio_value(portfolio_id UUID)
RETURNS DECIMAL AS $$
  SELECT SUM(quantity * current_price)
  FROM investments
  WHERE portfolio_id = $1
$$ LANGUAGE SQL;
```

### Edge Functions

Deploy serverless functions for backend logic:

```bash
supabase functions new my-function
supabase functions deploy my-function
```

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Keep service_role key secret** - only use server-side
3. **Use RLS policies** for all user data
4. **Enable MFA** for your Supabase account
5. **Regularly review** auth logs in dashboard

## Troubleshooting

### Connection Errors

- Verify `.env.local` has correct values
- Check if project URL has `https://`
- Ensure API keys don't have extra spaces

### RLS Policy Errors

- Make sure user is authenticated
- Verify policies match your use case
- Check auth.uid() returns the correct user ID

### SQL Errors

- Check for syntax errors in schema.sql
- Ensure all tables are created in correct order
- Verify enum types are created before tables use them

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

Your Supabase backend is now ready! 🎉

Next steps:

- Create your first user account
- Add some test portfolios
- Run the Python scripts to fetch market data
