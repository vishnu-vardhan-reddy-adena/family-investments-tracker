"""
NSE Data Fetcher for Portfolio Tracker
Fetches live stock prices and market data from NSE India
"""

import requests
import json
from datetime import datetime
from typing import Dict, List, Optional
import time

class NSEDataFetcher:
    """Fetch live data from NSE India"""
    
    def __init__(self):
        self.base_url = "https://www.nseindia.com"
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        }
        self.session.headers.update(self.headers)
        self._initialize_session()
    
    def _initialize_session(self):
        """Initialize session by visiting NSE homepage to get cookies"""
        try:
            self.session.get(self.base_url, timeout=10)
            time.sleep(1)  # Wait for cookies to be set
        except Exception as e:
            print(f"Error initializing session: {e}")
    
    def get_quote(self, symbol: str) -> Optional[Dict]:
        """
        Get live quote for a stock symbol
        
        Args:
            symbol: NSE stock symbol (e.g., 'RELIANCE', 'TCS')
            
        Returns:
            Dictionary containing stock quote data
        """
        try:
            url = f"{self.base_url}/api/quote-equity?symbol={symbol}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract relevant fields
            if 'priceInfo' in data:
                price_info = data['priceInfo']
                return {
                    'symbol': symbol,
                    'company_name': data.get('info', {}).get('companyName', ''),
                    'isin': data.get('info', {}).get('isin', ''),
                    'current_price': price_info.get('lastPrice', 0),
                    'previous_close': price_info.get('previousClose', 0),
                    'open': price_info.get('open', 0),
                    'high': price_info.get('intraDayHighLow', {}).get('max', 0),
                    'low': price_info.get('intraDayHighLow', {}).get('min', 0),
                    'change': price_info.get('change', 0),
                    'change_percent': price_info.get('pChange', 0),
                    'volume': data.get('preOpenMarket', {}).get('totalTradedVolume', 0),
                    'last_updated': datetime.now().isoformat(),
                    'raw_data': data
                }
            return None
        except Exception as e:
            print(f"Error fetching quote for {symbol}: {e}")
            return None
    
    def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Optional[Dict]]:
        """
        Get quotes for multiple symbols
        
        Args:
            symbols: List of NSE stock symbols
            
        Returns:
            Dictionary mapping symbols to their quote data
        """
        results = {}
        for symbol in symbols:
            results[symbol] = self.get_quote(symbol)
            time.sleep(0.5)  # Avoid rate limiting
        return results
    
    def get_index_data(self, index_name: str = "NIFTY 50") -> Optional[Dict]:
        """
        Get index data (NIFTY 50, NIFTY BANK, etc.)
        
        Args:
            index_name: Name of the index
            
        Returns:
            Dictionary containing index data
        """
        try:
            # Map common names to NSE index names
            index_map = {
                "NIFTY 50": "NIFTY 50",
                "NIFTY BANK": "NIFTY BANK",
                "SENSEX": "NIFTY 50"  # Note: SENSEX is BSE, use NIFTY as proxy
            }
            
            index = index_map.get(index_name, index_name)
            url = f"{self.base_url}/api/allIndices"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Find the specific index
            for item in data.get('data', []):
                if item.get('index') == index:
                    return {
                        'index_name': index,
                        'current_value': item.get('last', 0),
                        'change': item.get('change', 0),
                        'change_percent': item.get('percentChange', 0),
                        'last_updated': datetime.now().isoformat()
                    }
            return None
        except Exception as e:
            print(f"Error fetching index data: {e}")
            return None
    
    def search_symbol(self, query: str) -> List[Dict]:
        """
        Search for stocks by company name or symbol
        
        Args:
            query: Search query
            
        Returns:
            List of matching stocks
        """
        try:
            url = f"{self.base_url}/api/search/autocomplete?q={query}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('symbols', [])
        except Exception as e:
            print(f"Error searching symbols: {e}")
            return []


def main():
    """Example usage"""
    fetcher = NSEDataFetcher()
    
    # Example 1: Get single quote
    print("Fetching RELIANCE quote...")
    quote = fetcher.get_quote("RELIANCE")
    if quote:
        print(f"Symbol: {quote['symbol']}")
        print(f"Company: {quote['company_name']}")
        print(f"Price: ₹{quote['current_price']}")
        print(f"Change: {quote['change_percent']}%")
        print()
    
    # Example 2: Get multiple quotes
    print("Fetching multiple quotes...")
    symbols = ["TCS", "INFY", "HDFCBANK"]
    quotes = fetcher.get_multiple_quotes(symbols)
    for symbol, data in quotes.items():
        if data:
            print(f"{symbol}: ₹{data['current_price']} ({data['change_percent']}%)")
    print()
    
    # Example 3: Get index data
    print("Fetching NIFTY 50 data...")
    index = fetcher.get_index_data("NIFTY 50")
    if index:
        print(f"{index['index_name']}: {index['current_value']} ({index['change_percent']}%)")


if __name__ == "__main__":
    main()
