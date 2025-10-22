# Avatar Upload Setup Guide

## Issue: "Failed to upload file"

This error occurs when the Supabase storage bucket isn't properly configured.

## Solution

### Step 1: Check if you're using local or hosted Supabase

**If using hosted Supabase (Supabase Cloud):**
Go to: https://app.supabase.com

**If using local Supabase:**
Start Docker and run: `npx supabase start`

### Step 2: Create the Storage Bucket

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click **"New bucket"** or **"Create bucket"**
4. Enter these settings:
   - **Name:** `avatars`
   - **Public bucket:** ✅ Enabled (checked)
   - **File size limit:** `2097152` (2MB in bytes)
   - **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`
5. Click **"Create bucket"**

#### Option B: Via SQL Editor

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy and paste the contents of `setup_storage_bucket.sql`
5. Click **"Run"** or press `Ctrl+Enter`

### Step 3: Set up Row Level Security Policies

The SQL script (`setup_storage_bucket.sql`) already includes RLS policies. If you created the bucket manually via the dashboard, you need to add policies:

1. Go to **Storage** → **Policies**
2. Click on the **avatars** bucket
3. Click **"New Policy"**
4. Create these 4 policies:

**Policy 1: Upload Own Avatar**

```sql
Policy name: Users can upload own avatars
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression:
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 2: Public Read**

```sql
Policy name: Public avatar access
Allowed operation: SELECT
Target roles: public
USING expression: bucket_id = 'avatars'
```

**Policy 3: Update Own Avatar**

```sql
Policy name: Users can update own avatars
Allowed operation: UPDATE
Target roles: authenticated
USING expression:
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
WITH CHECK expression:
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 4: Delete Own Avatar**

```sql
Policy name: Users can delete own avatars
Allowed operation: DELETE
Target roles: authenticated
USING expression:
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
```

### Step 4: Verify the Setup

Run this query in the SQL Editor:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
```

You should see:

- 1 bucket named 'avatars' with public = true
- 4 policies for the avatars bucket

### Step 5: Test the Upload

1. Restart your dev server: `npm run dev`
2. Go to `/profile`
3. Try uploading an avatar
4. Check the terminal for debug logs:
   - "Uploading avatar for user: [user-id]"
   - "Uploading to bucket: avatars, path: [user-id]/[timestamp].[ext]"
   - "Upload successful: [data]"

### Common Issues

#### Issue 1: "Bucket not found"

**Solution:** Create the bucket following Step 2

#### Issue 2: "new row violates row-level security policy"

**Solution:**

- Make sure RLS policies are created (Step 3)
- Verify you're authenticated (logged in)
- Check that policies use `auth.uid()::text` not just `auth.uid()`

#### Issue 3: "File uploaded but not showing"

**Solution:**

- Check if bucket is public (Step 2)
- Verify the public URL is being generated correctly
- Check browser console for CORS errors

#### Issue 4: Files in wrong location

**Solution:**
The app now uploads files to `{user_id}/{timestamp}.{ext}` structure.
Old files may be at `avatars/{user_id}-{timestamp}.{ext}` - these need manual cleanup.

### File Structure

Avatars are now organized by user ID:

```
avatars/
├── user-uuid-1/
│   ├── 1698765432000.jpg
│   └── 1698765433000.png
└── user-uuid-2/
    └── 1698765434000.jpg
```

This structure:

- ✅ Improves organization
- ✅ Makes RLS policies simpler
- ✅ Allows per-user storage quotas
- ✅ Easy cleanup when user deletes account

### Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

No additional variables needed for storage!

### Debug Mode

The upload route now includes detailed logging. Check your terminal for:

- User authentication status
- Upload path and bucket
- Success/error details

If you see an error, share the full error message from the terminal.
