"""
Supabase Data Updater
Updates market data in Supabase database using NSE and mutual fund fetchers
Runs automatically every hour from 9 AM to 4 PM IST on trading days
"""

import os
import sys
import time
import schedule
import pytz
from datetime import datetime, time as dt_time
from typing import List, Dict
from supabase import create_client, Client
from dotenv import load_dotenv

# Import our fetchers
from nse_fetcher import NSEDataFetcher
from mutual_fund_fetcher import MutualFundFetcher

# Load environment variables from scripts/.env
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=env_path)

class SupabaseUpdater:
    """Update market data in Supabase"""

    def __init__(self):
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment variables")

        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.nse_fetcher = NSEDataFetcher()
        self.mf_fetcher = MutualFundFetcher()

    def update_stock_data(self, symbols: List[str]) -> None:
        """
        Update stock data for given symbols

        Args:
            symbols: List of NSE stock symbols to update
        """
        print(f"Updating data for {len(symbols)} stocks...")

        quotes = self.nse_fetcher.get_multiple_quotes(symbols)

        for symbol, data in quotes.items():
            if data:
                try:
                    # Upsert into market_data table
                    self.supabase.table('market_data').upsert({
                        'symbol': data['symbol'],
                        'isin': data.get('isin'),
                        'company_name': data.get('company_name'),
                        'current_price': data.get('current_price'),
                        'previous_close': data.get('previous_close'),
                        'change_percent': data.get('change_percent'),
                        'volume': data.get('volume'),
                        'last_updated': datetime.now().isoformat(),
                        'data_source': 'NSE',
                        'raw_data': data.get('raw_data')
                    }, on_conflict='symbol').execute()

                    print(f"✓ Updated {symbol}")
                except Exception as e:
                    print(f"✗ Error updating {symbol}: {e}")

    def update_mutual_fund_data(self, scheme_codes: List[str]) -> None:
        """
        Update mutual fund NAV data

        Args:
            scheme_codes: List of AMFI scheme codes
        """
        print(f"Updating data for {len(scheme_codes)} mutual funds...")

        for code in scheme_codes:
            data = self.mf_fetcher.get_scheme_details(code)

            if data:
                try:
                    self.supabase.table('mutual_fund_data').upsert({
                        'scheme_code': data['scheme_code'],
                        'scheme_name': data['scheme_name'],
                        'nav': data['nav'],
                        'nav_date': data['nav_date'],
                        'fund_house': data['fund_house'],
                        'category': data.get('scheme_category'),
                        'last_updated': datetime.now().isoformat(),
                        'raw_data': data.get('raw_data')
                    }, on_conflict='scheme_code').execute()

                    print(f"✓ Updated {data['scheme_name']}")
                except Exception as e:
                    print(f"✗ Error updating {code}: {e}")

    def get_active_symbols_from_portfolio(self) -> List[str]:
        """
        Get list of stock symbols that users have in their portfolios

        Returns:
            List of unique stock symbols
        """
        try:
            response = self.supabase.table('investments').select('symbol').eq(
                'investment_type', 'stock'
            ).execute()

            symbols = set()
            for row in response.data:
                if row.get('symbol'):
                    symbols.add(row['symbol'])

            return list(symbols)
        except Exception as e:
            print(f"Error fetching active symbols: {e}")
            return []

    def get_all_symbols_from_metadata(self) -> List[str]:
        """
        Get list of ALL stock symbols from stock_metadata table

        Returns:
            List of all stock symbols in the database
        """
        try:
            response = self.supabase.table('stock_metadata').select('symbol').execute()

            symbols = []
            for row in response.data:
                if row.get('symbol'):
                    symbols.append(row['symbol'])

            print(f"Found {len(symbols)} stocks in stock_metadata table")
            return symbols
        except Exception as e:
            print(f"Error fetching symbols from metadata: {e}")
            # Fallback to market_data table if stock_metadata doesn't exist
            try:
                response = self.supabase.table('market_data').select('symbol').execute()
                symbols = []
                for row in response.data:
                    if row.get('symbol'):
                        symbols.append(row['symbol'])
                print(f"Found {len(symbols)} stocks in market_data table")
                return symbols
            except Exception as e2:
                print(f"Error fetching symbols from market_data: {e2}")
                return []

    def update_all_portfolio_stocks(self) -> None:
        """Update market data for all stocks in user portfolios"""
        symbols = self.get_active_symbols_from_portfolio()
        if symbols:
            print(f"Found {len(symbols)} unique stocks in portfolios")
            self.update_stock_data(symbols)
        else:
            print("No stocks found in portfolios")

    def update_all_stocks(self) -> None:
        """Update market data for ALL stocks in the database"""
        symbols = self.get_all_symbols_from_metadata()
        if symbols:
            print(f"Updating ALL {len(symbols)} stocks from database")
            self.update_stock_data(symbols)
        else:
            print("No stocks found in database")


def is_trading_day() -> bool:
    """Check if today is a trading day (Monday-Friday)"""
    ist = pytz.timezone('Asia/Kolkata')
    now = datetime.now(ist)
    # Monday = 0, Sunday = 6
    return now.weekday() < 5  # Monday to Friday


def is_trading_hours() -> bool:
    """Check if current time is within trading hours (9 AM - 4 PM IST)"""
    ist = pytz.timezone('Asia/Kolkata')
    now = datetime.now(ist)
    current_time = now.time()

    # Trading hours: 9:00 AM to 4:00 PM IST
    market_open = dt_time(9, 0)
    market_close = dt_time(16, 0)

    return market_open <= current_time <= market_close


def update_job():
    """Job function that runs every hour during trading hours"""
    ist = pytz.timezone('Asia/Kolkata')
    now = datetime.now(ist)
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S IST")

    print(f"\n{'='*60}")
    print(f"Update Job Triggered at {timestamp}")
    print(f"{'='*60}")

    if not is_trading_day():
        day_name = now.strftime("%A")
        print(f"⏸️  Skipping update - Today is {day_name} (not a trading day)")
        return

    if not is_trading_hours():
        print(f"⏸️  Skipping update - Outside trading hours (9 AM - 4 PM IST)")
        return

    try:
        updater = SupabaseUpdater()
        print("✅ Connected to Supabase successfully")
        print(f"📊 Updating ALL stocks from database...")
        updater.update_all_stocks()
        print(f"✓ Update completed successfully at {timestamp}!")
    except Exception as e:
        print(f"❌ Error during update: {str(e)}")
        import traceback
        traceback.print_exc()


def run_scheduler():
    """Run the scheduler that updates data every hour from 9 AM to 4 PM IST"""
    ist = pytz.timezone('Asia/Kolkata')

    print("\n" + "="*60)
    print("🚀 NSE Market Data Auto-Updater Started")
    print("="*60)
    print(f"📍 Timezone: India Standard Time (IST)")
    print(f"⏰ Schedule: Every hour from 9 AM to 4 PM")
    print(f"📅 Days: Monday to Friday (Trading days only)")
    print(f"🕐 Started at: {datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S IST')}")
    print("="*60)
    print("\n💡 Press Ctrl+C to stop the scheduler\n")

    # Schedule updates for every hour from 9 AM to 4 PM
    schedule.every().hour.at(":00").do(update_job)

    # Run immediately on start if within trading hours
    if is_trading_day() and is_trading_hours():
        print("🔄 Running initial update...")
        update_job()
    else:
        now = datetime.now(ist)
        print(f"⏸️  Outside trading hours. Waiting for next scheduled run...")
        print(f"   Current time: {now.strftime('%H:%M:%S IST')}")
        print(f"   Trading hours: 9:00 AM - 4:00 PM IST (Mon-Fri)")

    # Keep the scheduler running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n\n" + "="*60)
        print("🛑 Scheduler stopped by user")
        print(f"🕐 Stopped at: {datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S IST')}")
        print("="*60)


def main():
    """Main function - choose between manual update or scheduled updates"""
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--schedule":
        # Run in scheduled mode
        run_scheduler()
    else:
        # Run manual update (single run)
        print("=== Manual Update Mode ===")
        print("💡 Tip: Use 'python update_market_data.py --schedule' for automatic hourly updates")
        print()

        updater = SupabaseUpdater()
        print("=== Updating ALL Stocks from Database ===")
        updater.update_all_stocks()
        print("\n✓ Update completed!")
        print("\n💡 To enable automatic updates every hour (9 AM - 4 PM IST):")
        print("   python update_market_data.py --schedule")


if __name__ == "__main__":
    main()
