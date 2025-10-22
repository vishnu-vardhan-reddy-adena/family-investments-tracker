# Quick Start Guide

Get your Portfolio Tracker up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed
- [ ] Supabase account created
- [ ] npm or yarn installed

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)

```bash
# Install Node.js packages
npm install

# Install Python packages
cd scripts
pip install -r requirements.txt
cd ..
```

### 2. Configure Supabase (2 minutes)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Add your Supabase credentials to `.env.local`:
   - Get URL and keys from Supabase Dashboard → Settings → API

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

4. In Supabase Dashboard → SQL Editor, run the contents of `supabase/schema.sql`

### 3. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - You're ready! 🎉

## Next Steps

1. **Create an account**: Sign up using Supabase Auth
2. **Add a portfolio**: Create your first investment portfolio
3. **Add investments**: Start tracking your stocks, MFs, etc.
4. **Fetch live data**: Run Python scripts to update market prices

### Update Stock Prices

```bash
cd scripts
python update_market_data.py
```

## File Structure Overview

```
📁 Your Project
├── 📁 src/app/              # Next.js pages and routes
├── 📁 src/lib/              # Utilities and Supabase clients
├── 📁 scripts/              # Python data fetchers
├── 📁 supabase/             # Database schema
├── 📄 .env.local           # Your environment variables (create this!)
└── 📄 README.md            # Full documentation
```

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run type-check   # Check TypeScript types

# Python scripts
python scripts/nse_fetcher.py              # Fetch NSE data
python scripts/mutual_fund_fetcher.py      # Fetch MF data
python scripts/update_market_data.py       # Update Supabase
```

## Need Help?

- 📖 Full setup guide: See `README.md`
- 🗄️ Database setup: See `SUPABASE_SETUP.md`
- 🐛 Issues: Check console for errors
- 💡 Examples: See Python scripts for usage examples

## Troubleshooting

### "Cannot connect to Supabase"

- Check `.env.local` has correct values
- Verify Supabase project is active

### "Table does not exist"

- Run `supabase/schema.sql` in Supabase SQL Editor

### "Python module not found"

- Run `pip install -r scripts/requirements.txt`

### Port 3000 already in use

- Use a different port: `npm run dev -- -p 3001`

---

**You're all set!** Start tracking your investments! 📈
