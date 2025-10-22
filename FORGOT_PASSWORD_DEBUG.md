# Testing Forgot Password Flow

## Debug Steps

1. **Start Dev Server & Supabase**

   ```powershell
   npm run dev
   ```

   Make sure Supabase is running locally (if not already):

   ```powershell
   npx supabase start
   ```

2. **Test the Complete Flow**

   a. Go to `http://localhost:3000/login`

   b. Click "Forgot password?"

   c. Enter an email address (e.g., `test@example.com`)

   d. Click "Send Reset Link"

   e. Open Inbucket at `http://localhost:54324` to see the email

   f. Click on the reset link in the email

   g. **Check the terminal/console for debug logs:**
   - Look for "Callback - Code exchange error"
   - Look for "Callback - Type"
   - Look for "Reset password - User"

   h. Enter a new password and confirm

   i. Check console again for "Reset password" logs

3. **Expected Debug Output**

   When clicking the reset link, you should see:

   ```
   Callback - Code exchange error: null
   Callback - Type: recovery
   Callback - Next: /reset-password
   Redirecting to reset password page
   ```

   When submitting the new password:

   ```
   Reset password - User: test@example.com
   Reset password - Error: null
   ```

## Common Issues & Solutions

### Issue 1: "Invalid or expired reset token"

**Possible Causes:**

1. Session not being established after code exchange
2. Cookies not being set/read properly
3. Code already used (one-time use)

**Debug Steps:**

- Check browser DevTools → Application → Cookies
- Look for cookies like `sb-<project-ref>-auth-token`
- If no cookies, the session isn't being established

**Solution:**

- Make sure the callback route is properly exchanging the code
- Check that cookies are enabled in your browser
- Try in an incognito window to rule out extension issues

### Issue 2: Type parameter not being passed

The email link should include `type=recovery` parameter. Check the email in Inbucket.

**Expected URL format:**

```
http://localhost:3000/auth/callback?token_hash=xxx&type=recovery&next=/reset-password
```

If `type=recovery` is missing, Supabase isn't sending it correctly.

**Solution:**

- Update Supabase config to ensure recovery type is included
- Or modify callback to always treat password reset links specially

### Issue 3: Cookies not persisting across redirects

**Solution:**
Try using the server-side Supabase client differently or check middleware.

## Alternative Approach (If Issues Persist)

If the token exchange approach continues to have issues, we can use a different pattern:

### Option A: Pass token in URL

Instead of exchanging immediately, pass the token to the reset page and exchange there.

### Option B: Use magic link pattern

Similar to passwordless login, handle the token exchange on the reset page itself.

### Option C: Simplify callback

Remove the intermediate redirect and go directly to reset password from email.

## Testing Without Email

For faster testing, you can also test the API directly:

```powershell
# Request password reset
curl -X POST http://localhost:3000/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com"}'
```

Then check Inbucket for the email and follow the link.

## Next Steps Based on Debug Output

Please run the test flow and share:

1. The debug logs from the terminal
2. The URL you see when redirected to reset password page
3. The cookies in DevTools (Application → Cookies)
4. Any errors in the browser console

This will help identify exactly where the flow is breaking.
