"""
NSE Data Fetcher for Portfolio Tracker
Fetches live stock prices and market data from NSE India using nsepython library
"""

from nsepython import *
import json
from datetime import datetime
from typing import Dict, List, Optional
import time

class NSEDataFetcher:
    """Fetch live data from NSE India using nsepython"""

    def __init__(self):
        """Initialize NSE data fetcher"""
        pass

    def get_quote(self, symbol: str) -> Optional[Dict]:
        """
        Get live quote for a stock symbol

        Args:
            symbol: NSE stock symbol (e.g., 'RELIANCE', 'TCS')

        Returns:
            Dictionary containing stock quote data
        """
        try:
            # Fetch quote using nsepython
            data = nse_eq(symbol)

            if not data:
                print(f"No data returned for {symbol}")
                return None

            # Extract price info from nsepython response
            price_info = data.get('priceInfo', {})
            info = data.get('info', {})
            pre_open = data.get('preOpenMarket', {})
            metadata = data.get('metadata', {})

            current_price = float(price_info.get('lastPrice', 0))
            previous_close = float(price_info.get('previousClose', 0))
            change_percent = float(price_info.get('pChange', 0))

            return {
                'symbol': symbol,
                'company_name': info.get('companyName', metadata.get('companyName', '')),
                'isin': info.get('isin', metadata.get('isin', '')),
                'current_price': current_price,
                'previous_close': previous_close,
                'open': float(price_info.get('open', 0)),
                'high': float(price_info.get('intraDayHighLow', {}).get('max', 0)),
                'low': float(price_info.get('intraDayHighLow', {}).get('min', 0)),
                'change': float(price_info.get('change', 0)),
                'change_percent': change_percent,
                'volume': int(pre_open.get('totalTradedVolume', 0)),
                'last_updated': datetime.now().isoformat(),
                'raw_data': data
            }
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
            time.sleep(1)  # Avoid rate limiting
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
            # Map common names to NSE index symbols
            index_map = {
                "NIFTY 50": "NIFTY 50",
                "NIFTY BANK": "NIFTY BANK",
                "NIFTY": "NIFTY 50"
            }

            index = index_map.get(index_name, index_name)

            # Fetch index data using nsepython
            data = nse_get_index_quote(index)

            if data:
                return {
                    'index_name': index,
                    'current_value': float(data.get('lastPrice', 0)),
                    'change': float(data.get('change', 0)),
                    'change_percent': float(data.get('pChange', 0)),
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
            # nsepython doesn't have direct search, return empty for now
            # You can implement basic filtering if needed
            return []
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
