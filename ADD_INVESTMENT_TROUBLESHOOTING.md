# Add Investment Troubleshooting Guide

## Recent Fixes Applied ✅

### 1. **Improved Error Handling**

- Added proper error checking in API route
- Better error messages displayed to users
- Console logging for debugging

### 2. **Enhanced User Feedback**

- Success message shows when investment is added
- Detailed error messages with specific issues
- Loading state during submission

### 3. **Database Query Improvements**

- Changed `.single()` to `.maybeSingle()` for portfolio fetch
- Better handling of missing portfolios
- Improved error responses

## How to Test

### Step 1: Open the Application

1. Start dev server: `npm run dev`
2. Navigate to Dashboard or Transactions page
3. Click "Add Investment" button

### Step 2: Add a Stock

1. Select "Stock" as investment type
2. Fill in:
   - Symbol: RELIANCE
   - Company Name: Reliance Industries Ltd
   - Quantity: 10
   - Purchase Price: 2450
   - Purchase Date: (today's date auto-filled)
3. Click "Add Investment"
4. Should see success message and page refreshes

### Step 3: Check Console Logs

Open browser DevTools (F12) and check:

- **Console tab**: Look for log messages
  - "Adding investment: ..." when submitting
  - "Using portfolio: ..." when found/created
  - "Investment added successfully: ..." on success
  - Error messages if something fails

- **Network tab**: Check the API call
  - `/api/investments/add` should return 201 status
  - Response should have `success: true`

## Common Issues & Solutions

### Issue 1: "Unauthorized" Error

**Cause:** User not logged in
**Solution:**

- Make sure you're logged in
- Check if auth session is valid
- Try logging out and back in

### Issue 2: "Failed to create portfolio" Error

**Cause:** Database permissions issue
**Solution:**

- Check Supabase RLS policies are enabled
- Verify user has INSERT permission on portfolios table
- Run migrations: `npm run db:push`

### Issue 3: "Failed to add investment" Error

**Cause:** Database schema mismatch or missing fields
**Solution:**

- Check that investment_type enum exists in database
- Verify all required fields are being sent
- Check browser console for detailed error

### Issue 4: Modal doesn't open

**Cause:** Client component not rendering
**Solution:**

- Check that AddInvestmentButton is imported correctly
- Verify useState is working (check React DevTools)

### Issue 5: Page doesn't refresh after adding

**Cause:** onSuccess callback not working
**Solution:**

- Current implementation uses window.location.reload()
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

## Debug Checklist

When "Add Investment" is not working, check:

1. ✅ **Browser Console**: Any JavaScript errors?
2. ✅ **Network Tab**: Does `/api/investments/add` call succeed (201)?
3. ✅ **Response Body**: Contains `success: true`?
4. ✅ **Authentication**: User logged in? Check cookies
5. ✅ **Database**: Tables exist? Run: `npm run db:reset`
6. ✅ **Environment**: `.env.local` has correct Supabase credentials?
7. ✅ **Migrations**: All applied? Check Supabase dashboard

## Testing Different Investment Types

### Stock

```json
{
  "investmentType": "stock",
  "symbol": "RELIANCE",
  "companyName": "Reliance Industries Ltd",
  "quantity": "10",
  "purchasePrice": "2450",
  "purchaseDate": "2025-10-23"
}
```

### Fixed Deposit

```json
{
  "investmentType": "fixed_deposit",
  "accountNumber": "FD123456",
  "maturityAmount": "50000",
  "interestRate": "7.5",
  "purchaseDate": "2025-10-23",
  "maturityDate": "2026-10-23"
}
```

### Real Estate

```json
{
  "investmentType": "real_estate",
  "propertyType": "Residential",
  "location": "Mumbai, Maharashtra",
  "areaSqft": "1200",
  "purchasePrice": "5000000",
  "purchaseDate": "2025-10-23"
}
```

## API Endpoint Details

**URL:** `/api/investments/add`
**Method:** POST
**Auth:** Required (Cookie-based session)

**Request Body:**
All fields from FormData interface

**Success Response (201):**

```json
{
  "success": true,
  "investment": {
    /* investment object */
  },
  "message": "Investment added successfully"
}
```

**Error Response (400/401/500):**

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

## Logs to Check

### Client-Side (Browser Console):

```
Adding investment: { investmentType, symbol, companyName, user }
Investment added successfully: { data }
```

### Server-Side (Terminal):

```
Adding investment: { investmentType: 'stock', symbol: 'RELIANCE', ... }
Using portfolio: <uuid>
```

## Next Steps if Still Not Working

1. **Check Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Check if tables exist
   - Check RLS policies
   - View recent queries in SQL Editor

2. **Test API Directly**
   - Use Postman or curl
   - Test with valid auth token
   - Check exact error response

3. **Database Logs**
   - Check Supabase logs for SQL errors
   - Look for constraint violations
   - Check for missing enum values

4. **Restart Everything**

   ```bash
   # Kill all node processes
   pkill -f node

   # Clear Next.js cache
   rm -rf .next

   # Reinstall dependencies
   npm install

   # Start fresh
   npm run dev
   ```

## Success Indicators

When working correctly, you should see:

1. ✅ Modal opens smoothly
2. ✅ Form fields appear based on investment type
3. ✅ Green success message appears briefly
4. ✅ Modal closes automatically
5. ✅ Page refreshes showing new data
6. ✅ Console shows "Investment added successfully"

---

**Last Updated:** October 23, 2025
**Status:** Enhanced with better error handling and user feedback
