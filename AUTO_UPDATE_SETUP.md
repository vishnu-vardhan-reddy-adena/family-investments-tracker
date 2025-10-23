# Auto-Update Setup Guide

## Overview

The NSE market data updater now supports automatic hourly updates during trading hours (9 AM - 4 PM IST, Monday-Friday).

## Quick Setup

### 1. Configure Environment Variables

Edit `scripts/.env` and add your Supabase Service Role Key:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

**Where to find your Service Role Key:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the `service_role` key (⚠️ Keep this secret!)

### 2. Install Python Dependencies

```powershell
# Navigate to scripts directory
cd scripts

# Install required packages
pip install -r requirements.txt
```

### 3. Test Manual Update

```powershell
# Run a single manual update to test
python update_market_data.py
```

**Expected output:**

```
=== Manual Update Mode ===
💡 Tip: Use 'python update_market_data.py --schedule' for automatic hourly updates

=== Updating ALL Stocks from Database ===
Updating data for X stocks...
✓ Update completed!
```

### 4. Run Automatic Scheduler

```powershell
# Start the automatic hourly updater
python update_market_data.py --schedule
```

**Expected output:**

```
============================================================
🚀 NSE Market Data Auto-Updater Started
============================================================
📍 Timezone: India Standard Time (IST)
⏰ Schedule: Every hour from 9 AM to 4 PM
📅 Days: Monday to Friday (Trading days only)
🕐 Started at: 2025-10-23 10:30:00 IST
============================================================

💡 Press Ctrl+C to stop the scheduler

🔄 Running initial update...
```

## Features

### Smart Scheduling

- ✅ **Trading Days Only**: Automatically skips weekends
- ✅ **Trading Hours**: Only updates between 9 AM - 4 PM IST
- ✅ **Hourly Updates**: Runs at the top of every hour (9:00, 10:00, 11:00, etc.)
- ✅ **Timezone Aware**: Uses India Standard Time (IST)

### Update Modes

#### Manual Mode (Single Run)

```powershell
python update_market_data.py
```

- Runs once and exits
- Good for testing or manual updates
- No scheduling

#### Scheduled Mode (Continuous)

```powershell
python update_market_data.py --schedule
```

- Runs continuously in the background
- Updates every hour during trading hours
- Skips non-trading days and after-hours automatically

## Running as Background Service

### Windows - Task Scheduler

1. **Open Task Scheduler**: `Win + R` → `taskschd.msc`

2. **Create Basic Task**:
   - Name: "NSE Market Data Updater"
   - Trigger: "At startup" or "Daily at 8:55 AM"
   - Action: "Start a program"

3. **Program Details**:

   ```
   Program: python.exe
   Arguments: D:\PF Track\scripts\update_market_data.py --schedule
   Start in: D:\PF Track\scripts
   ```

4. **Settings**:
   - ✅ Run whether user is logged in or not
   - ✅ Run with highest privileges
   - ✅ If task fails, restart every 1 minute up to 3 times

### Keep Terminal Window Open

If running in PowerShell/CMD and want to keep it running:

```powershell
# This will run continuously until you press Ctrl+C
python update_market_data.py --schedule
```

**To stop**: Press `Ctrl+C`

## Monitoring

### Check if Running

The scheduler will print status messages:

```
============================================================
Update Job Triggered at 2025-10-23 10:00:00 IST
============================================================
✅ Connected to Supabase successfully
📊 Updating ALL stocks from database...
Found 50 unique stocks in database
Updating data for 50 stocks...
✓ Update completed successfully at 2025-10-23 10:00:05 IST!
```

### Check Logs

The script outputs to stdout. To save logs:

```powershell
# Save logs to file
python update_market_data.py --schedule > updater_logs.txt 2>&1
```

## Troubleshooting

### ❌ Error: "Supabase credentials not found"

**Solution**: Make sure `scripts/.env` has the correct `SUPABASE_SERVICE_ROLE_KEY`

### ❌ Error: "Import schedule could not be resolved"

**Solution**: Install dependencies

```powershell
pip install -r requirements.txt
```

### ❌ Updates not running during trading hours

**Checklist**:

1. Verify current time is between 9 AM - 4 PM IST
2. Verify today is Monday-Friday (not weekend)
3. Check script output for skip messages

### ❌ NSE API errors

**Common causes**:

- NSE website is down or under maintenance
- Rate limiting (too many requests)
- Network connectivity issues

**Solution**: The script will log errors but continue running. Next hourly update will retry.

## Configuration

### Change Trading Hours

Edit `update_market_data.py`:

```python
def is_trading_hours() -> bool:
    # Change these times as needed
    market_open = dt_time(9, 0)   # 9:00 AM
    market_close = dt_time(16, 0)  # 4:00 PM
```

### Change Update Frequency

Edit the schedule line:

```python
# Current: Every hour
schedule.every().hour.at(":00").do(update_job)

# Every 30 minutes:
schedule.every(30).minutes.do(update_job)

# Every 15 minutes:
schedule.every(15).minutes.do(update_job)
```

## Security Notes

⚠️ **NEVER commit `.env` file to git**

- The `.env` file contains your service role key
- This key has full database access
- Already added to `.gitignore`

✅ **Service Role Key Permissions**

- Only use service role key in server-side scripts
- Never expose in client-side code
- Keep it secret and secure

## Next Steps

1. ✅ Setup `.env` with your service role key
2. ✅ Install Python dependencies
3. ✅ Test manual update
4. ✅ Run scheduled updater
5. ⏭️ Optional: Setup as Windows service/scheduled task

## Support

If you encounter issues:

1. Check the error message
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check Supabase dashboard for API issues
