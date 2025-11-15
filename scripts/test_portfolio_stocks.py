"""
Test nsepython with your actual portfolio stocks
"""

from nsepython import *
from datetime import datetime
import time

print("=" * 70)
print("Testing NSE Python with Your Portfolio Stocks")
print("=" * 70)
print(f"Test Time: {datetime.now()}\n")

# Your actual portfolio stocks from the database
test_stocks = [
    "RELIANCE", "HDFCBANK", "ETERNAL", "KPITTECH", "IKIO",
    "IOB", "RPOWER", "MTARTECH", "AUBANK", "INDUSINDBK",
    "SBIN", "YESBANK", "DATAPATTNS", "INOXINDIA", "INNOVACAP",
    "NTPCGREEN", "SUZLON", "RTNPOWER"
]

print(f"Testing {len(test_stocks)} stocks from your portfolio...\n")

success_count = 0
failed_count = 0
results = []

for symbol in test_stocks:
    try:
        print(f"Fetching {symbol}...", end=" ")
        data = nse_eq(symbol)

        if data and 'priceInfo' in data:
            price_info = data.get('priceInfo', {})
            metadata = data.get('metadata', {})

            last_price = price_info.get('lastPrice', 0)
            change_percent = price_info.get('pChange', 0)
            company_name = metadata.get('companyName', 'N/A')

            results.append({
                'symbol': symbol,
                'price': last_price,
                'change': change_percent,
                'company': company_name,
                'status': 'SUCCESS'
            })

            print(f"✓ ₹{last_price} ({change_percent:+.2f}%)")
            success_count += 1
        else:
            results.append({
                'symbol': symbol,
                'status': 'NO_DATA'
            })
            print("✗ No data returned")
            failed_count += 1

        # Add small delay to avoid rate limiting
        time.sleep(0.5)

    except Exception as e:
        results.append({
            'symbol': symbol,
            'status': 'ERROR',
            'error': str(e)
        })
        print(f"✗ Error: {str(e)[:50]}")
        failed_count += 1

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Total Stocks Tested: {len(test_stocks)}")
print(f"✓ Successful: {success_count} ({success_count/len(test_stocks)*100:.1f}%)")
print(f"✗ Failed: {failed_count} ({failed_count/len(test_stocks)*100:.1f}%)")

print("\n" + "-" * 70)
print("STOCKS WITH LIVE PRICES:")
print("-" * 70)
for result in results:
    if result['status'] == 'SUCCESS':
        print(f"{result['symbol']:15} ₹{result['price']:10.2f}  {result['change']:+7.2f}%")

if failed_count > 0:
    print("\n" + "-" * 70)
    print("FAILED STOCKS:")
    print("-" * 70)
    for result in results:
        if result['status'] != 'SUCCESS':
            status = result.get('error', result['status'])
            print(f"{result['symbol']:15} {status}")

print("\n" + "=" * 70)
print("VERDICT:")
if success_count >= len(test_stocks) * 0.8:  # 80% success rate
    print("✓ NSE Python is WORKING WELL!")
    print("  Most stocks are fetching live data successfully.")
elif success_count >= len(test_stocks) * 0.5:  # 50% success rate
    print("⚠ NSE Python is PARTIALLY WORKING")
    print("  Some stocks are failing. This could be due to:")
    print("  - Invalid/delisted symbols")
    print("  - Rate limiting from NSE")
    print("  - Network issues")
else:
    print("✗ NSE Python has ISSUES")
    print("  Most requests are failing. Possible causes:")
    print("  - NSE website changes")
    print("  - Network/firewall blocks")
    print("  - nsepython library needs update")

print("=" * 70)
