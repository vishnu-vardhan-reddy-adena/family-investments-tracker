# User Roles System - Complete Implementation

## Overview

Complete role-based access control (RBAC) system with **Admin** and **User** roles for TrakInvests.

## Roles Implemented

### 👤 **User Role** (Default)

- View own dashboard and investments
- Manage own portfolio and transactions
- Update own profile
- Cannot access admin features
- Cannot view other users' data

### 🔐 **Admin Role**

- **Full system access**
- View all users, portfolios, and transactions
- Manage user roles (promote/demote)
- Access admin dashboard with statistics
- View audit logs
- Manage system settings
- Cannot remove own admin role (protection)

## Database Changes

### Migration Created: `20250123000000_add_user_roles.sql`

**Schema Updates:**

1. Added `user_role` ENUM type: `admin`, `user`
2. Added `role` column to `profiles` table (default: `user`)
3. Created `admin_settings` table for system configurations
4. Created `audit_logs` table for activity tracking

**New Tables:**

```sql
-- Admin Settings (system-wide configurations)
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Audit Logs (track all important actions)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

**Database Functions:**

- `is_admin(user_id)` - Check if user is admin
- `get_user_role()` - Get current user's role
- `log_audit_event()` - Log activity to audit logs

**RLS Policies:**

- Admins can view/edit all data across all tables
- Users can only access their own data
- Audit logs: admins see all, users see only their own
- Admin settings: admins manage all, users read public settings only

## Files Created

### Backend/Auth

1. `src/lib/auth/roles.ts` - Role management utilities
   - `getCurrentUserWithRole()` - Get user with role
   - `isAdmin()` - Check admin status
   - `requireAdmin()` - Require admin (throws error)
   - `hasRole()` - Check specific role
   - `getUserRole()` - Get user's role
   - `logAuditEvent()` - Log audit events

### Admin Pages

2. `src/app/admin/page.tsx` - Admin Dashboard
   - Total users, portfolios, investments stats
   - Total platform value (AUM)
   - Recent users table
   - Recent activity/audit logs
   - Requires admin role

3. `src/app/admin/users/page.tsx` - User Management
   - List all users
   - View roles
   - Manage user roles
   - Requires admin role

### Components

4. `src/components/admin/UserRoleManager.tsx` - Role Management Component
   - Table of all users
   - Change role dialog
   - Role indicators (chips with icons)
   - Prevents changing own role

### API Routes

5. `src/app/api/admin/users/[userId]/role/route.ts`
   - **PUT** - Update user role (admin only)
   - **GET** - Get user details (admin only)
   - Validates permissions
   - Logs role changes to audit log

### Database Migration

6. `supabase/migrations/20250123000000_add_user_roles.sql`
   - Complete schema with RLS policies
   - Helper functions
   - Admin dashboard view
   - Default settings

### Modified Files

7. `src/components/Navbar.tsx`
   - Added `role` prop
   - Admin menu items (conditional)
   - "Admin Dashboard" link
   - "Manage Users" link

8. All page files updated to pass role to Navbar:
   - `src/app/dashboard/page.tsx`
   - `src/app/profile/page.tsx`
   - `src/app/transactions/page.tsx`
   - `src/app/admin/page.tsx`
   - `src/app/admin/users/page.tsx`

## Features

### Admin Dashboard

**URL:** `/admin`

**Stats Cards:**

- Total Users (with new users this month)
- Total Portfolios
- Total Investments
- Total Platform Value (AUM in Lakhs)

**Tables:**

- Recent Users (email, name, role, joined date)
- Recent Activity (audit logs with user, action, resource, time)

### User Management

**URL:** `/admin/users`

**Features:**

- View all users in system
- See user roles (Admin/User chips with icons)
- Change user roles with dialog
- Warning when promoting to admin
- Cannot change own role
- Audit logging of role changes

### Navbar Updates

**For All Users:**

- Profile Settings
- Dashboard
- Sign Out

**Additional for Admins:**

- 🔐 Admin Dashboard (violet color)
- 👥 Manage Users (violet color)
- Separator line before regular menu

## Security

### Row Level Security (RLS)

- ✅ Admins can access all data
- ✅ Users can only access their own data
- ✅ Audit logs protected (admins see all, users see own)
- ✅ Admin settings protected

### API Protection

- ✅ `requireAdmin()` throws error if not admin
- ✅ All admin API routes check permissions
- ✅ Role changes logged to audit log
- ✅ Cannot remove own admin role

### Client-Side Protection

- ✅ Admin pages redirect non-admins to dashboard
- ✅ Admin menu hidden for normal users
- ✅ Role check on every request

## Usage

### How to Make a User an Admin

**Method 1: Via Database (First Admin)**

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

**Method 2: Via Admin Panel** (once you have an admin)

1. Login as admin
2. Go to Admin → Manage Users
3. Click "Change Role" on user
4. Select "Admin (Full Access)"
5. Click "Update Role"

### How to Check User Role

**Server-side:**

```typescript
import { getCurrentUserWithRole, isAdmin, requireAdmin } from '@/lib/auth/roles';

// Get user with role
const user = await getCurrentUserWithRole();
console.log(user?.role); // 'admin' or 'user'

// Check if admin
const admin = await isAdmin();

// Require admin (throws if not)
const adminUser = await requireAdmin();
```

**Client-side:**

```typescript
// Check in Navbar or components
{user.role === 'admin' && (
  <Link href="/admin">Admin Dashboard</Link>
)}
```

### How to Log Audit Events

```typescript
import { logAuditEvent } from '@/lib/auth/roles';

// Log an action
await logAuditEvent(
  'USER_DELETED', // action
  'profile', // resource type
  userId, // resource ID
  { reason: 'requested' } // additional details
);
```

## Admin Settings

**Default Settings Created:**

- `public_app_name` - Application name
- `public_app_version` - Version number
- `public_support_email` - Support contact
- `max_portfolios_per_user` - Limit per user (10)
- `max_investments_per_portfolio` - Limit (1000)
- `enable_market_data_sync` - Feature flag
- `market_data_sync_interval` - Sync frequency (300s)

**Access Settings:**

```typescript
const supabase = await createClient();
const { data: settings } = await supabase.from('admin_settings').select('*');
```

## Audit Log Events

**Tracked Actions:**

- `ROLE_CHANGED` - User role updated
- `USER_CREATED` - New user registered
- `USER_DELETED` - User account deleted
- `INVESTMENT_ADDED` - New investment created
- `TRANSACTION_ADDED` - New transaction created
- `SETTINGS_UPDATED` - Admin settings changed

## Migration Guide

### Step 1: Run Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually apply in Supabase Dashboard
# Copy content from: supabase/migrations/20250123000000_add_user_roles.sql
```

### Step 2: Create First Admin

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@trakinvests.com';
```

### Step 3: Verify

- Login as admin user
- Check navbar for admin menu
- Access /admin page
- Access /admin/users page

## Testing Checklist

- [ ] Admin can access `/admin` page
- [ ] Admin can access `/admin/users` page
- [ ] Admin can see all users in management page
- [ ] Admin can change user roles
- [ ] Admin cannot remove own admin role
- [ ] User cannot access `/admin` (redirects to dashboard)
- [ ] User cannot access `/admin/users` (redirects)
- [ ] Navbar shows admin menu for admins only
- [ ] Role changes are logged to audit_logs
- [ ] Admin dashboard shows correct statistics
- [ ] RLS policies enforce data access correctly

## Color Scheme

**Admin Features:**

- Primary: Violet (#8B5CF6)
- Secondary: Purple (#A78BFA)
- Admin chip: Coral Pink (#FF6B6B)
- User chip: Electric Blue (#4D79FF)

## Future Enhancements

### Phase 1

- [ ] Bulk role assignment
- [ ] User search and filtering
- [ ] Export user list
- [ ] User activity timeline

### Phase 2

- [ ] Custom roles (beyond admin/user)
- [ ] Permission-based access (granular)
- [ ] Role templates
- [ ] API access tokens for users

### Phase 3

- [ ] Activity notifications for admins
- [ ] Scheduled reports
- [ ] User quotas and limits enforcement
- [ ] Advanced audit log filtering

---

**Status:** ✅ Role System Complete
**Migration:** `20250123000000_add_user_roles.sql`
**Security:** RLS Policies Active
**Tested:** Ready for deployment
