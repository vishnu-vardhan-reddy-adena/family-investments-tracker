# Admin User Setup Guide

## Overview

This guide explains how to promote a user to admin role in TrakInvests. Admin users have access to additional features like Excel import functionality.

## Understanding Roles

- **User Role (Default)**: Standard access to manage their own portfolio
- **Admin Role**: Full access including:
  - All user capabilities
  - Import data from Excel/CSV
  - View system statistics (future feature)
  - Manage other users (future feature)

**Note**: A user can only have ONE role at a time. Admin users automatically have all user capabilities.

## Setup Methods

### Method 1: PowerShell Script (Windows - Recommended)

```powershell
# Navigate to scripts folder
cd scripts

# Option A: Promote specific user by email
.\setup-admin.ps1 -Email "user@example.com"

# Option B: Promote first registered user (good for initial setup)
.\setup-admin.ps1 -FirstUser

# Option C: List all users first, then decide
.\setup-admin.ps1 -ListUsers

# Option D: Interactive menu
.\setup-admin.ps1
```

### Method 2: Bash Script (Linux/Mac)

```bash
# Navigate to scripts folder
cd scripts

# Make script executable (first time only)
chmod +x setup-admin.sh

# Option A: Promote specific user by email
./setup-admin.sh -e "user@example.com"

# Option B: Promote first registered user
./setup-admin.sh -f

# Option C: List all users
./setup-admin.sh -l

# Option D: Interactive menu
./setup-admin.sh
```

### Method 3: Direct SQL (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/setup_admin_user.sql`
4. Choose one of the options and run it:

**Promote by Email:**

```sql
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify
SELECT id, email, full_name, role
FROM public.profiles
WHERE email = 'user@example.com';
```

**Promote First User (Initial Setup):**

```sql
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE id = (
  SELECT id FROM public.profiles
  ORDER BY created_at ASC
  LIMIT 1
);

-- Verify
SELECT id, email, full_name, role
FROM public.profiles
ORDER BY created_at ASC
LIMIT 1;
```

### Method 4: Supabase CLI

```bash
# Promote by email
supabase db query "UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE email = 'user@example.com';"

# Verify
supabase db query "SELECT id, email, full_name, role FROM public.profiles WHERE email = 'user@example.com';" --format table
```

## Initial Setup Workflow

For a fresh installation, follow these steps:

1. **Register your first user** through the application
2. **Run the setup script** to promote that user to admin:
   ```powershell
   # Windows
   cd scripts
   .\setup-admin.ps1 -FirstUser
   ```
   ```bash
   # Linux/Mac
   cd scripts
   ./setup-admin.sh -f
   ```
3. **Login again** to see admin features (Excel import button)
4. **Optionally** promote other users to admin as needed

## Verifying Admin Status

### Check in Application

- Login with the promoted user
- Go to Dashboard
- You should see the **"Import from Excel"** button

### Check in Database

```sql
-- View all admin users
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at ASC;
```

## Common Scenarios

### Scenario 1: First Time Setup

```powershell
# Promote the first registered user to admin
.\setup-admin.ps1 -FirstUser
```

### Scenario 2: Promote Specific User

```powershell
# List users to find the email
.\setup-admin.ps1 -ListUsers

# Promote the user
.\setup-admin.ps1 -Email "john@example.com"
```

### Scenario 3: Multiple Admins

```sql
-- Promote multiple users at once
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);
```

### Scenario 4: Demote Admin to User

```sql
-- Remove admin privileges
UPDATE public.profiles
SET role = 'user',
    updated_at = NOW()
WHERE email = 'user@example.com';
```

## Troubleshooting

### Issue: Script says "Supabase CLI not found"

**Solution**: Install Supabase CLI:

```bash
npm install -g supabase
```

### Issue: Admin features not showing after promotion

**Solution**:

1. Logout completely
2. Clear browser cache
3. Login again
4. Check that role was updated in database

### Issue: "Permission denied" on bash script

**Solution**: Make script executable:

```bash
chmod +x scripts/setup-admin.sh
```

### Issue: Can't find the user to promote

**Solution**: List all users first:

```powershell
# Windows
.\setup-admin.ps1 -ListUsers

# Linux/Mac
./setup-admin.sh -l
```

## Files Reference

- `supabase/migrations/setup_admin_user.sql` - SQL script with all options
- `scripts/setup-admin.ps1` - PowerShell script for Windows
- `scripts/setup-admin.sh` - Bash script for Linux/Mac
- `supabase/migrations/20251023000000_add_user_roles.sql` - Role system migration

## Security Notes

- Only promote trusted users to admin role
- Admin users can import data that affects all users
- Regularly audit admin users:
  ```sql
  SELECT email, full_name, role, created_at
  FROM public.profiles
  WHERE role = 'admin';
  ```
- Consider implementing audit logging for admin actions (future feature)

## Next Steps

After setting up admin users:

1. ✅ Admin can now import Excel/CSV data
2. ✅ Admin sees additional features in the dashboard
3. 🔄 Future: Admin dashboard with analytics
4. 🔄 Future: User management interface

## Need Help?

- Check the main `README.md` for general setup
- See `ROLES_SYSTEM.md` for detailed role system documentation
- Review `MIGRATIONS.md` for database schema information
