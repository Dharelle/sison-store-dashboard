import json

with open('data/store_sales.json') as f:
    data = json.load(f)

# Filter out zero-profit entries
records = [r for r in data['records'] if r['totalProfit'] > 0]

# Sort by date descending
records_sorted = sorted(records, key=lambda x: x['date'], reverse=True)

print('Most recent transactions with actual data:')
for i in range(min(10, len(records_sorted))):
    r = records_sorted[i]
    print(f'{r["date"]} - Profit: P{r["totalProfit"]:.2f}')

print(f'\nTotal records: {len(data["records"])}')
print(f'Records with data: {len(records)}')
print(f'Oldest date: {records_sorted[-1]["date"]}')
print(f'Newest date: {records_sorted[0]["date"]}')
