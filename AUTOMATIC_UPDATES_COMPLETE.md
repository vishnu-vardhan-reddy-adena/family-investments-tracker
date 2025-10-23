# ✅ Auto-Update Feature - Complete Setup

## What's Been Implemented

### 🎯 Automatic Hourly Updates

- **Schedule**: Every hour from 9:00 AM to 4:00 PM IST
- **Days**: Monday to Friday (Trading days only)
- **Smart Skip**: Automatically skips weekends and after-hours
- **Timezone**: India Standard Time (IST) aware

### 📁 Files Created/Updated

1. **`scripts/update_market_data.py`** ✅ Updated
   - Added automatic scheduling with `schedule` library
   - Added timezone awareness with `pytz`
   - Trading hours check (9 AM - 4 PM IST)
   - Trading days check (Mon-Fri)
   - Two modes: Manual (single run) and Scheduled (continuous)

2. **`scripts/.env`** ✅ Created
   - Environment variables for Python scripts
   - Needs your Supabase service role key

3. **`scripts/requirements.txt`** ✅ Updated
   - Added: `schedule>=1.2.0`
   - Added: `pytz>=2023.3`

4. **`scripts/setup_updater.bat`** ✅ Created
   - Windows setup script
   - Installs dependencies automatically
   - Tests configuration

5. **`scripts/setup_updater.sh`** ✅ Created
   - Linux/Mac setup script
   - Bash equivalent of Windows script

6. **Documentation Files** ✅ Created
   - `AUTO_UPDATE_SETUP.md` - Complete setup guide
   - `GET_SERVICE_ROLE_KEY.md` - How to get your API key

## 🚀 Quick Start Guide

### Step 1: Get Your Service Role Key

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the `service_role` key (not anon key)

### Step 2: Configure Environment

Edit `scripts/.env` and paste your service role key:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Install Dependencies (Already Done! ✅)

```powershell
cd scripts
pip install -r requirements.txt
```

### Step 4: Test Manual Update

```powershell
python update_market_data.py
```

**Expected Output:**

```
=== Manual Update Mode ===
💡 Tip: Use 'python update_market_data.py --schedule' for automatic hourly updates

=== Updating ALL Stocks from Database ===
Updating data for X stocks...
✓ Update completed!
```

### Step 5: Start Automatic Scheduler

```powershell
python update_market_data.py --schedule
```

**Expected Output:**

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
```

## 📊 How It Works

### Schedule Logic

```
9:00 AM IST  → Update runs
10:00 AM IST → Update runs
11:00 AM IST → Update runs
12:00 PM IST → Update runs
1:00 PM IST  → Update runs
2:00 PM IST  → Update runs
3:00 PM IST  → Update runs
4:00 PM IST  → Update runs (last update)
4:01 PM IST  → Skipped (after hours)
```

### Trading Day Check

```
Monday    ✅ Runs
Tuesday   ✅ Runs
Wednesday ✅ Runs
Thursday  ✅ Runs
Friday    ✅ Runs
Saturday  ❌ Skipped
Sunday    ❌ Skipped
```

### Update Workflow

1. **Every Hour** (at :00 minutes)
2. **Check**: Is it a trading day? (Mon-Fri)
3. **Check**: Is it trading hours? (9 AM - 4 PM IST)
4. **If YES**: Fetch all symbols from `stock_metadata` table
5. **Update**: Get live NSE data for all stocks
6. **Store**: Update prices in `market_data` table
7. **Wait**: Until next hour

## 🎮 Usage Modes

### Mode 1: Manual Update (Single Run)

```powershell
python update_market_data.py
```

**Use when:**

- Testing the setup
- One-time manual update needed
- Troubleshooting

### Mode 2: Scheduled Updates (Continuous)

```powershell
python update_market_data.py --schedule
```

**Use when:**

- Running in production
- Want automatic hourly updates
- Keep terminal window open or run as service

**To stop**: Press `Ctrl+C`

## 🔧 Advanced Configuration

### Change Update Frequency

Edit `update_market_data.py`, line ~175:

```python
# Every hour (current)
schedule.every().hour.at(":00").do(update_job)

# Every 30 minutes
schedule.every(30).minutes.do(update_job)

# Every 15 minutes
schedule.every(15).minutes.do(update_job)
```

### Change Trading Hours

Edit `update_market_data.py`, line ~35:

```python
def is_trading_hours() -> bool:
    # Change these times
    market_open = dt_time(9, 0)   # 9:00 AM
    market_close = dt_time(16, 0)  # 4:00 PM
```

### Run as Windows Service

See `AUTO_UPDATE_SETUP.md` section "Running as Background Service"

## 🐛 Troubleshooting

### Error: "Supabase credentials not found"

**Fix**: Update `scripts/.env` with your service role key

```bash
SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
```

### Error: "Import schedule could not be resolved"

**Fix**: Install dependencies

```powershell
cd scripts
pip install -r requirements.txt
```

### Updates not running

**Check**:

1. Current time is 9 AM - 4 PM IST
2. Today is Monday-Friday
3. Script shows skip messages if outside hours

### Can't find service role key

See `GET_SERVICE_ROLE_KEY.md` for step-by-step guide

## 📚 Documentation

- **`AUTO_UPDATE_SETUP.md`** - Full setup and configuration guide
- **`GET_SERVICE_ROLE_KEY.md`** - How to get Supabase API key
- **`scripts/update_market_data.py`** - Main updater script (with comments)

## ✅ Next Steps

1. [ ] Get your Supabase service role key
2. [ ] Update `scripts/.env` with the key
3. [ ] Test: `python update_market_data.py`
4. [ ] Run: `python update_market_data.py --schedule`
5. [ ] Optional: Setup as Windows Task Scheduler for automatic startup

## 🎉 Benefits

- ✅ **No Manual Work**: Runs automatically every hour
- ✅ **Smart Scheduling**: Only during trading hours
- ✅ **All Stocks**: Updates ALL stocks in your database
- ✅ **Timezone Aware**: Correctly handles IST timezone
- ✅ **Error Handling**: Continues running even if one update fails
- ✅ **Easy Monitoring**: Clear console output with timestamps

---

**Ready to Start?** Just add your service role key to `scripts/.env` and run:

```powershell
cd scripts
python update_market_data.py --schedule
```

🚀 **That's it!** Your portfolio will now update automatically every hour during market hours!
