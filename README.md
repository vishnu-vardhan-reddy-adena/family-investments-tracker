# Portfolio Tracker 📊

A comprehensive portfolio tracking application for managing Indian investments including stocks, mutual funds, ETFs, fixed deposits, NPS, EPFO, real estate, and more. Built with Next.js 14+, Supabase, and Python for live NSE data integration.

## ✨ Features

- 📈 **Live NSE Data**: Real-time stock prices and market data from NSE India
- 👨‍👩‍👧‍👦 **Family Portfolio Management**: Track investments for yourself and family members
- 💼 **Multiple Asset Types**:
  - Indian Stocks (NSE/BSE)
  - Mutual Funds
  - ETFs
  - Fixed Deposits (FDs)
  - National Pension System (NPS)
  - Employee Provident Fund (EPFO)
  - Real Estate
  - Gold, Bonds, and more
- 📊 **Consolidated & Individual Views**: View portfolios member-wise or consolidated
- 🔐 **Secure Authentication**: Powered by Supabase Auth
- 🎨 **Modern UI**: Built with Tailwind CSS for a beautiful, responsive design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Data Fetching**: Python scripts for NSE/BSE data
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account

## 🚀 Getting Started

### 1. Clone the Repository

Since you're already in the project directory, skip to step 2.

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd scripts
pip install -r requirements.txt
cd ..
```

**Install Supabase CLI:**

**Windows:**

```powershell
scoop install supabase
# Or download from: https://github.com/supabase/cli/releases
```

**macOS:**

```bash
brew install supabase/tap/supabase
```

**Linux:**

```bash
brew install supabase/tap/supabase
# Or download from: https://github.com/supabase/cli/releases
```

Verify installation:

```bash
supabase --version
```

### 3. Set Up Supabase

**Option A: Using Migrations (Recommended)**

```bash
# Link to your Supabase project
supabase link --project-ref your-project-id

# Apply all migrations (creates tables, RLS policies, triggers, functions, AND storage buckets)
supabase db push
```

This will automatically set up:

- ✅ All database tables and schemas
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers and functions
- ✅ Storage buckets (avatars) with proper policies

**Option B: Manual Setup**

1. Create a new project in [Supabase](https://app.supabase.com/)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and execute it
4. This will create all necessary tables, indexes, and RLS policies

📚 **Learn more**: See [MIGRATIONS.md](./MIGRATIONS.md) for detailed migration guide

### 4. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   copy .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Find these values in your Supabase project settings under **API**.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔄 Database Migrations

This project uses **version-controlled migrations** managed by Supabase CLI and automated via GitHub Actions.

### Creating New Migrations

```bash
# Windows
scripts\new-migration.bat add_feature_name

# Linux/Mac
./scripts/new-migration.sh add_feature_name
```

### Testing Migrations Locally

```bash
# Reset database and apply all migrations
supabase db reset

# Apply migrations
supabase db push

# Verify migration status
supabase migration list
```

### Automated Deployment

When you push migrations to GitHub:

1. GitHub Actions automatically triggers
2. Migrations are applied to your Supabase project
3. Verification runs to ensure success

**Setup Required:**

- Add GitHub Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`
- See [MIGRATIONS.md](./MIGRATIONS.md) for complete guide

## 📁 Project Structure

```
PF Track/
├── .github/
│   ├── workflows/
│   │   └── supabase-migrations.yml  # Automated migration deployment
│   └── copilot-instructions.md      # GitHub Copilot workspace instructions
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── auth/                # Authentication routes
│   │   ├── dashboard/           # Dashboard page
│   │   ├── profile/             # User profile page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   ├── lib/
│   │   └── supabase/            # Supabase client configuration
│   │       ├── client.ts        # Browser client
│   │       ├── server.ts        # Server client
│   │       └── middleware.ts    # Auth middleware
│   └── types/
│       └── database.types.ts    # TypeScript database types
├── scripts/                      # Python & migration scripts
│   ├── nse_fetcher.py           # NSE stock data fetcher
│   ├── mutual_fund_fetcher.py   # Mutual fund NAV fetcher
│   ├── update_market_data.py    # Supabase data updater
│   ├── new-migration.sh         # Create migration (Linux/Mac)
│   ├── new-migration.bat        # Create migration (Windows)
│   └── requirements.txt         # Python dependencies
├── supabase/
│   ├── migrations/              # Version-controlled migrations
│   │   ├── 20251022000000_initial_schema.sql
│   │   └── template.sql         # Migration template
│   ├── schema.sql               # Current complete schema (reference)
│   └── config.toml              # Supabase configuration
├── MIGRATIONS.md                # Migration guide
├── SUPABASE_SETUP.md            # Supabase setup guide
├── PROFILE_FEATURE.md           # Profile feature documentation
├── package.json                 # Node.js dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── next.config.ts               # Next.js configuration
```

## 🐍 Using Python Scripts

### Fetch Live Stock Data

```bash
cd scripts
python nse_fetcher.py
```

### Update Market Data in Supabase

```bash
python update_market_data.py
```

This script:

- Fetches all stock symbols from user portfolios
- Updates current prices from NSE
- Stores data in the `market_data` table

### Schedule Automatic Updates

You can set up a cron job or scheduled task to run the updater periodically:

**Windows Task Scheduler**: Run `update_market_data.py` every hour during market hours

**Linux/Mac Cron**:

```bash
# Edit crontab
crontab -e

# Add this line to run every hour from 9 AM to 4 PM on weekdays
0 9-16 * * 1-5 cd /path/to/PF\ Track/scripts && python update_market_data.py
```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles**: User profile information
- **family_members**: Family member details
- **portfolios**: Portfolio containers for investments
- **investments**: Individual investment holdings
- **transactions**: Buy/sell transaction history
- **market_data**: Cached NSE stock market data
- **mutual_fund_data**: Mutual fund NAV data

See `supabase/schema.sql` for complete schema with RLS policies.

## 🔐 Authentication

The app uses Supabase Authentication. Row Level Security (RLS) policies ensure:

- Users can only access their own data
- Family member data is restricted to the owner
- Market data is read-only for all authenticated users

## 🎨 Customization

### Adding New Investment Types

1. Update the `investment_type` enum in `supabase/schema.sql`
2. Add type-specific fields to the `investments` table
3. Update TypeScript types in `src/types/database.types.ts`

### Styling

The app uses Tailwind CSS. Customize colors and theme in:

- `tailwind.config.ts`
- `src/app/globals.css`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building
- `npm run format` - Auto-format code with Prettier
- `npm run format:check` - Check code formatting

## 🔒 Automated Git Hooks

The project uses **Husky** to automatically validate code before pushing:

**Pre-Push Checks (runs automatically):**

- ✅ Type checking (`npm run type-check`)
- ✅ Build validation (`npm run build`)
- ✅ Format checking (`npm run format:check`)

**Benefits:**

- Prevents broken code from reaching remote repository
- Catches TypeScript errors, missing imports, syntax issues
- Enforces code quality standards
- No more failed GitHub Actions due to build errors

**See [GIT_HOOKS_SETUP.md](./GIT_HOOKS_SETUP.md) for details.**

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- NSE India for market data
- Supabase for the amazing backend platform
- Next.js team for the excellent framework
- AMFI for mutual fund data

## 💡 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced portfolio analytics and charts
- [ ] Tax harvesting recommendations
- [ ] Asset allocation suggestions
- [ ] Email/SMS alerts for price targets
- [ ] Export to Excel/PDF reports
- [ ] Integration with broker APIs for auto-import

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Note**: This application is for personal use and educational purposes. Always verify financial data from official sources before making investment decisions.
