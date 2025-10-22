# Avatar Upload Setup Guide

## Supabase Storage Configuration

To enable avatar uploads, you need to create a storage bucket in Supabase.

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name:** `avatars`
   - **Public bucket:** ✅ **Enable** (so avatar URLs are publicly accessible)
   - **Allowed MIME types:** Leave default or specify: `image/jpeg, image/png, image/gif, image/webp`
   - **Max file size:** `2097152` (2MB in bytes)

5. Click **"Create bucket"**

### Step 2: Set Storage Policies

After creating the bucket, set up Row Level Security (RLS) policies:

1. Go to **Storage** → **Policies**
2. Click on the **`avatars`** bucket
3. Add the following policies:

#### Policy 1: Allow authenticated users to upload their own avatars

```sql
-- Policy Name: Users can upload their own avatars
-- Operation: INSERT
-- Policy:
(bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
```

#### Policy 2: Allow public read access

```sql
-- Policy Name: Public avatar access
-- Operation: SELECT
-- Policy:
bucket_id = 'avatars'
```

#### Policy 3: Allow users to update their own avatars

```sql
-- Policy Name: Users can update their own avatars
-- Operation: UPDATE
-- Policy:
(bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
```

#### Policy 4: Allow users to delete their own avatars

```sql
-- Policy Name: Users can delete their own avatars
-- Operation: DELETE
-- Policy:
(bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
```

### Step 3: Verify Setup

1. Try uploading a photo from the profile page
2. Check that the file appears in Storage → avatars
3. Verify the avatar displays on the profile page

### Alternative: Quick Setup via SQL

You can also create the bucket and policies via SQL Editor:

```sql
-- Create the bucket (run this in Supabase SQL Editor if bucket doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## How It Works

1. **File Upload**: User selects a photo from their device
2. **Validation**: Client checks file type (JPEG/PNG/GIF/WEBP) and size (max 2MB)
3. **Upload to Storage**: File is uploaded to `avatars/[user_id]-[timestamp].ext`
4. **Get Public URL**: Supabase returns a public URL for the uploaded file
5. **Update Profile**: The `avatar_url` field in the `profiles` table is updated
6. **Display**: Avatar is displayed using the public URL

## File Structure

```
supabase storage: avatars/
├── [user-id-1]-1234567890.jpg
├── [user-id-2]-1234567891.png
└── [user-id-3]-1234567892.webp
```

## Features

- ✅ File type validation (JPEG, PNG, GIF, WEBP)
- ✅ File size limit (2MB)
- ✅ Preview before upload
- ✅ Loading state during upload
- ✅ Automatic profile update
- ✅ Public URL generation
- ✅ Secure RLS policies (users can only manage their own avatars)

## Troubleshooting

### "Upload failed" error

- Check that the `avatars` bucket exists
- Verify RLS policies are set up correctly
- Check browser console for detailed error messages

### Avatar not displaying

- Ensure the bucket is set to **public**
- Check that the `avatar_url` in the profiles table contains a valid URL
- Verify the file was uploaded successfully in Storage dashboard

### Permission denied

- Check that RLS policies allow authenticated users to upload
- Verify the user is logged in
- Check that the folder name matches the user ID

---

**Need help?** Check the Supabase Storage documentation: https://supabase.com/docs/guides/storage
