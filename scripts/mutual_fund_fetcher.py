"""
Mutual Fund NAV Fetcher
Fetches NAV data for Indian mutual funds from AMFI
"""

import requests
from datetime import datetime
from typing import Dict, List, Optional
import json

class MutualFundFetcher:
    """Fetch mutual fund NAV data from AMFI"""
    
    def __init__(self):
        self.base_url = "https://api.mfapi.in"
    
    def get_scheme_details(self, scheme_code: str) -> Optional[Dict]:
        """
        Get details and latest NAV for a mutual fund scheme
        
        Args:
            scheme_code: AMFI scheme code
            
        Returns:
            Dictionary containing scheme details and NAV
        """
        try:
            url = f"{self.base_url}/mf/{scheme_code}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') == 'SUCCESS':
                latest_nav = data['data'][0] if data.get('data') else {}
                
                return {
                    'scheme_code': scheme_code,
                    'scheme_name': data.get('meta', {}).get('scheme_name', ''),
                    'fund_house': data.get('meta', {}).get('fund_house', ''),
                    'scheme_type': data.get('meta', {}).get('scheme_type', ''),
                    'scheme_category': data.get('meta', {}).get('scheme_category', ''),
                    'nav': float(latest_nav.get('nav', 0)),
                    'nav_date': latest_nav.get('date', ''),
                    'last_updated': datetime.now().isoformat(),
                    'raw_data': data
                }
            return None
        except Exception as e:
            print(f"Error fetching scheme {scheme_code}: {e}")
            return None
    
    def get_all_schemes(self) -> List[Dict]:
        """
        Get list of all mutual fund schemes
        
        Returns:
            List of all available schemes
        """
        try:
            # Note: This is a placeholder. You may need to use AMFI website
            # or another source to get the complete list of schemes
            print("Fetching all schemes list...")
            # This would require scraping AMFI website or using another API
            return []
        except Exception as e:
            print(f"Error fetching schemes list: {e}")
            return []
    
    def search_schemes(self, query: str, schemes_list: List[Dict]) -> List[Dict]:
        """
        Search for mutual fund schemes by name
        
        Args:
            query: Search query
            schemes_list: List of all schemes to search in
            
        Returns:
            List of matching schemes
        """
        query_lower = query.lower()
        return [
            scheme for scheme in schemes_list
            if query_lower in scheme.get('scheme_name', '').lower()
            or query_lower in scheme.get('fund_house', '').lower()
        ]


def main():
    """Example usage"""
    fetcher = MutualFundFetcher()
    
    # Example: Get details for a specific scheme
    # You'll need to know the scheme code
    print("Fetching mutual fund details...")
    
    # Example scheme codes (HDFC Top 100 Fund)
    scheme_code = "119551"  
    details = fetcher.get_scheme_details(scheme_code)
    
    if details:
        print(f"Scheme: {details['scheme_name']}")
        print(f"Fund House: {details['fund_house']}")
        print(f"NAV: ₹{details['nav']}")
        print(f"NAV Date: {details['nav_date']}")


if __name__ == "__main__":
    main()
