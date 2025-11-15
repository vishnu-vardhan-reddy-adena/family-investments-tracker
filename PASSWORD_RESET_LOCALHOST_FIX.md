# Fixing Password Reset Redirect to Localhost

## Problem

When requesting a password reset, the email contains a link that redirects to `localhost:3000` instead of your production domain.

## Root Cause

The password reset flow uses the `NEXT_PUBLIC_SITE_URL` environment variable to construct the redirect URL. If this variable is not set, it defaults to `http://localhost:3000`.

## Solution

### 1. Local Development

Update your `.env.local` file to include `NEXT_PUBLIC_SITE_URL`:

```bash
# For local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

✅ **This has been added automatically to your `.env.local` file.**

### 2. Production Deployment

For production (Vercel, Netlify, etc.), you need to add the environment variable with your actual domain.

#### On Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://your-production-domain.com` (replace with your actual domain)
   - **Environment**: Select "Production" (and "Preview" if needed)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

#### On Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add a new variable:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://your-production-domain.com`
3. Click **Save**
4. **Redeploy** your site

#### On Other Platforms:

Add the environment variable through your platform's dashboard or CLI:

```bash
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### 3. Supabase Configuration

You also need to configure the Site URL and Redirect URLs in your Supabase project:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to your production domain:
   ```
   https://your-production-domain.com
   ```
4. Add **Redirect URLs** (one per line):

   ```
   https://your-production-domain.com/**
   http://localhost:3000/**
   ```

   The `/**` wildcard allows all paths under your domain.

5. Click **Save**

### 4. Email Template Verification (Optional)

Verify your Supabase email template is configured correctly:

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** (or **Magic Link** if using magic links)
3. Ensure the template uses the `{{ .ConfirmationURL }}` variable
4. The URL will now use your configured Site URL

Example template:

```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link expires in 1 hour.</p>
```

## Testing

### Local Testing:

1. Restart your Next.js dev server to pick up the new environment variable:

   ```bash
   npm run dev
   ```

2. Go to `/forgot-password`
3. Enter your email
4. Check your email (or Inbucket at `http://localhost:54324` for local Supabase)
5. The link should now use `http://localhost:3000`

### Production Testing:

1. Deploy your application with the new environment variable
2. Go to `https://your-domain.com/forgot-password`
3. Request a password reset
4. Check your email
5. The link should now use `https://your-domain.com`

## Files Modified

- ✅ `.env.local` - Added `NEXT_PUBLIC_SITE_URL`
- ✅ `.env.example` - Created example environment file with documentation

## Current Code Reference

The password reset email is sent in `src/app/auth/forgot-password/route.ts`:

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
});
```

## Environment Variables Summary

Your application now requires these environment variables:

| Variable                        | Description                 | Example                   |
| ------------------------------- | --------------------------- | ------------------------- |
| `NEXT_PUBLIC_APP_URL`           | Application base URL        | `http://localhost:3000`   |
| `NEXT_PUBLIC_SITE_URL`          | Site URL for auth redirects | `http://localhost:3000`   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL        | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key      | `eyJhbGc...`              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key   | `eyJhbGc...`              |

## Troubleshooting

### Still redirecting to localhost?

1. **Restart your dev server** - Environment variables are loaded at build time
2. **Clear browser cache** - Old links might be cached
3. **Check Supabase URL Configuration** - Ensure Site URL is set correctly
4. **Verify environment variable** - Check that `NEXT_PUBLIC_SITE_URL` is set in your deployment platform
5. **Redeploy** - Make sure to redeploy after adding the environment variable

### Email not being sent?

1. Check Supabase email logs: **Authentication** → **Logs**
2. Verify email is confirmed in Supabase: **Authentication** → **Users**
3. Check spam folder
4. Configure SMTP in production for better deliverability

## Related Documentation

- `FORGOT_PASSWORD_FEATURE.md` - Complete forgot password feature documentation
- `.env.example` - Environment variables template
- `SUPABASE_SETUP.md` - Supabase configuration guide
