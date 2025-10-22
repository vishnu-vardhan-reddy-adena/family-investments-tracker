# Forgot Password Feature

## Overview

The forgot password feature allows users to reset their password by receiving a secure reset link via email.

## How It Works

1. **User requests password reset** - User enters their email on `/forgot-password`
2. **Supabase sends email** - A secure reset link is sent to the user's email
3. **User clicks link** - The link redirects to `/reset-password` with a secure token
4. **User sets new password** - User enters and confirms their new password
5. **Password updated** - User is redirected to login with their new password

## Files Created

### Pages

- `src/app/forgot-password/page.tsx` - Forgot password request page
- `src/app/reset-password/page.tsx` - New password entry page

### API Routes

- `src/app/auth/forgot-password/route.ts` - Handles password reset email sending
- `src/app/auth/reset-password/route.ts` - Handles password update

### Configuration Updates

- `src/lib/supabase/middleware.ts` - Added `/reset-password` to public routes

## Usage

### For Users

1. Go to login page and click "Forgot password?"
2. Enter your email address
3. Check your email for the reset link
4. Click the link in the email
5. Enter and confirm your new password
6. Login with your new password

### For Developers

#### Local Development

1. Supabase local development uses Inbucket for email testing
2. Access Inbucket at `http://localhost:54324` to see sent emails
3. Click on the reset link in the email to test the flow

#### Production Setup

1. **Configure Email Provider** in Supabase Dashboard:
   - Go to **Authentication** → **Email Templates**
   - Click on **Reset Password** template
   - Customize the email template if needed
   - Confirm URL contains: `{{ .ConfirmationURL }}`

2. **Set up SMTP** (optional for better deliverability):
   - Go to **Settings** → **Auth**
   - Scroll to **SMTP Settings**
   - Configure your SMTP provider (SendGrid, Mailgun, etc.)

3. **Environment Variables**:

   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

4. **Supabase Auth Settings**:
   - In Supabase Dashboard: **Authentication** → **URL Configuration**
   - Add your production URL to **Site URL**
   - Add redirect URLs if using custom domains

## Email Template

The default Supabase reset password email includes:

- A secure, time-limited reset link
- User-friendly instructions
- Link expires after 1 hour

### Customizing the Email

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Select **Reset Password**
3. Customize the HTML template:

```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link expires in 1 hour.</p>
```

## Security Features

- ✅ Time-limited reset tokens (1 hour expiry)
- ✅ One-time use tokens
- ✅ Password validation (minimum 6 characters)
- ✅ Secure token handling via Supabase Auth
- ✅ CSRF protection via Next.js
- ✅ Client-side and server-side validation

## Testing

### Local Testing (with Inbucket)

```bash
# Start Supabase local
npm run db:start

# Start Next.js dev server
npm run dev

# Navigate to forgot password page
# http://localhost:3000/forgot-password

# Enter email and submit
# Check Inbucket at http://localhost:54324
```

### Production Testing

1. Deploy to production
2. Navigate to `/forgot-password`
3. Enter a real email address
4. Check your email inbox
5. Click the reset link
6. Enter new password
7. Login with new password

## Troubleshooting

### Email not received

1. **Check Spam folder** - Reset emails might be marked as spam
2. **Check Supabase logs** - Dashboard → **Authentication** → **Users**
3. **Verify email settings** - Dashboard → **Settings** → **Auth**
4. **Check SMTP configuration** - If using custom SMTP
5. **Rate limits** - Supabase has rate limits on auth emails

### Reset link not working

1. **Expired link** - Links expire after 1 hour, request a new one
2. **Already used** - Reset links are one-time use only
3. **Wrong environment** - Make sure the link matches your current environment

### "Invalid or expired reset token" error

1. Request a new password reset
2. Use the link immediately after receiving it
3. Don't refresh the reset password page
4. Check that cookies are enabled

### Password not updating

1. Check password meets minimum requirements (6 characters)
2. Ensure passwords match
3. Check browser console for errors
4. Verify Supabase connection

## API Reference

### POST /auth/forgot-password

Request body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "message": "Password reset email sent successfully"
}
```

### POST /auth/reset-password

Request body:

```json
{
  "password": "newpassword123"
}
```

Response:

```json
{
  "message": "Password updated successfully"
}
```

## Configuration

### Supabase Config (`supabase/config.toml`)

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://yourdomain.com"]

[auth.email]
enable_signup = true
enable_confirmations = false  # Set to true in production
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (defaults to http://localhost:3000 in development)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Set reasonable password requirements
3. ✅ Use strong SMTP provider for production
4. ✅ Monitor failed reset attempts
5. ✅ Customize email templates for branding
6. ✅ Test the complete flow before deployment
7. ✅ Keep reset token expiry reasonable (1 hour is good)
8. ✅ Log reset requests for security monitoring

## Future Enhancements

- [ ] Add rate limiting to prevent abuse
- [ ] Send confirmation email after password change
- [ ] Add password strength indicator
- [ ] Support for magic link login as alternative
- [ ] Two-factor authentication
- [ ] Security questions as additional verification
- [ ] Account recovery via phone/SMS
