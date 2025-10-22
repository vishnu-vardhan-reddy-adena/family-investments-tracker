"""
Supabase Data Updater
Updates market data in Supabase database using NSE and mutual fund fetchers
"""

import os
import sys
from datetime import datetime
from typing import List, Dict
from supabase import create_client, Client
from dotenv import load_dotenv

# Import our fetchers
from nse_fetcher import NSEDataFetcher
from mutual_fund_fetcher import MutualFundFetcher

# Load environment variables
load_dotenv()

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
    
    def update_all_portfolio_stocks(self) -> None:
        """Update market data for all stocks in user portfolios"""
        symbols = self.get_active_symbols_from_portfolio()
        if symbols:
            print(f"Found {len(symbols)} unique stocks in portfolios")
            self.update_stock_data(symbols)
        else:
            print("No stocks found in portfolios")


def main():
    """Main function to run updates"""
    updater = SupabaseUpdater()
    
    # Update all stocks in user portfolios
    print("=== Updating Portfolio Stocks ===")
    updater.update_all_portfolio_stocks()
    
    # Optionally update specific stocks
    # updater.update_stock_data(['RELIANCE', 'TCS', 'INFY'])
    
    # Optionally update mutual funds
    # updater.update_mutual_fund_data(['119551', '118989'])
    
    print("\n✓ Update completed!")


if __name__ == "__main__":
    main()
