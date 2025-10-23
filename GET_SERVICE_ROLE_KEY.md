# Get Your Supabase Service Role Key

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login to your account

2. **Select Your Project**
   - Click on your project: `vhuvcsomnxntirnyxunj`

3. **Navigate to API Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API** in the settings menu

4. **Copy Service Role Key**
   - Find the **Project API keys** section
   - Look for `service_role` key (NOT the anon key)
   - Click the copy icon or reveal the key
   - ⚠️ **WARNING**: This key has FULL access to your database - keep it secret!

5. **Update the .env file**
   - Open `scripts/.env` in VS Code
   - Replace `your-supabase-service-role-key-here` with your actual key
   - Save the file

## Example .env File

```bash
# Supabase Configuration for Python Scripts

NEXT_PUBLIC_SUPABASE_URL=https://vhuvcsomnxntirnyxunj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (Required for data updates)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodXZjc29tbnhudGlybnl4dW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Test the Setup

After updating the `.env` file:

```powershell
# Navigate to scripts directory
cd scripts

# Test manual update
python update_market_data.py
```

If successful, you'll see:

```
=== Manual Update Mode ===
💡 Tip: Use 'python update_market_data.py --schedule' for automatic hourly updates

=== Updating ALL Stocks from Database ===
Updating data for X stocks...
✓ Update completed!
```

## Start Automatic Updates

Once the test passes:

```powershell
python update_market_data.py --schedule
```

This will run hourly updates automatically from 9 AM to 4 PM IST on trading days!

## Security Reminder

✅ **DO**:

- Keep your service role key in `scripts/.env` only
- The file is already in `.gitignore` (won't be committed)
- Use it only in server-side scripts

❌ **DON'T**:

- Share your service role key with anyone
- Commit it to GitHub or any version control
- Use it in client-side code (browser/frontend)
- Post it in public forums or documentation
