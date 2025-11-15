"""
Test script to verify nsepython is working
"""

from nsepython import *
import json
from datetime import datetime

print("=" * 60)
print("NSE Python Library Test")
print("=" * 60)
print(f"Test Time: {datetime.now()}\n")

# Test 1: Fetch a popular stock quote
print("Test 1: Fetching RELIANCE stock data...")
try:
    data = nse_eq("RELIANCE")
    if data:
        price_info = data.get('priceInfo', {})
        metadata = data.get('metadata', {})

        print("✓ SUCCESS!")
        print(f"  Company: {metadata.get('companyName', 'N/A')}")
        print(f"  Symbol: {metadata.get('symbol', 'N/A')}")
        print(f"  Last Price: ₹{price_info.get('lastPrice', 0)}")
        print(f"  Previous Close: ₹{price_info.get('previousClose', 0)}")
        print(f"  Change: {price_info.get('change', 0)} ({price_info.get('pChange', 0)}%)")
        print(f"  Volume: {price_info.get('totalTradedVolume', 0):,}")
    else:
        print("✗ FAILED - No data returned")
except Exception as e:
    print(f"✗ FAILED - Error: {str(e)}")

print("\n" + "-" * 60 + "\n")

# Test 2: Fetch another stock
print("Test 2: Fetching TCS stock data...")
try:
    data = nse_eq("TCS")
    if data:
        price_info = data.get('priceInfo', {})
        metadata = data.get('metadata', {})

        print("✓ SUCCESS!")
        print(f"  Company: {metadata.get('companyName', 'N/A')}")
        print(f"  Last Price: ₹{price_info.get('lastPrice', 0)}")
        print(f"  Change: {price_info.get('pChange', 0)}%")
    else:
        print("✗ FAILED - No data returned")
except Exception as e:
    print(f"✗ FAILED - Error: {str(e)}")

print("\n" + "-" * 60 + "\n")

# Test 3: Fetch NIFTY 50 index
print("Test 3: Fetching NIFTY 50 index data...")
try:
    data = nse_eq("NIFTY 50")
    if data:
        price_info = data.get('priceInfo', {})
        print("✓ SUCCESS!")
        print(f"  Index: NIFTY 50")
        print(f"  Last Price: {price_info.get('lastPrice', 0)}")
        print(f"  Change: {price_info.get('change', 0)} ({price_info.get('pChange', 0)}%)")
    else:
        print("✗ FAILED - No data returned")
except Exception as e:
    print(f"✗ FAILED - Error: {str(e)}")

print("\n" + "-" * 60 + "\n")

# Test 4: Check if NSE website is accessible
print("Test 4: Checking NSE website connectivity...")
try:
    import requests
    response = requests.get("https://www.nseindia.com", timeout=10)
    if response.status_code == 200:
        print("✓ SUCCESS - NSE website is accessible")
        print(f"  Status Code: {response.status_code}")
    else:
        print(f"✗ WARNING - Unexpected status code: {response.status_code}")
except Exception as e:
    print(f"✗ FAILED - Cannot reach NSE website: {str(e)}")

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)
