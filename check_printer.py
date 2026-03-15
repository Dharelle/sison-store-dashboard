import json
from datetime import datetime

with open('data/printer.json') as f:
    data = json.load(f)

print('Printer records with income > 0:')
for r in data['records']:
    if r['income'] > 0:
        print(f'{r["month"]} {r["year"]}: P{r["income"]}')

print('\nChecking last 3 months from March 15, 2026:')
print('Should include: December 2025, January 2026, February 2026')

# Simulate the filter
now = datetime(2026, 3, 15)
three_months_ago = datetime(now.year, now.month - 3, now.day)
print(f'\nFilter start date: {three_months_ago}')

months_map = {
    'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4,
    'MAY': 5, 'JUNE': 6, 'JULY': 7, 'AUGUST': 8,
    'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
}

print('\nFiltered records (last 3 months):')
for r in data['records']:
    if r['income'] > 0:
        month_num = months_map.get(r['month'].upper(), 0)
        year = r['year']

        # Check if within range
        if year > three_months_ago.year:
            print(f'✓ {r["month"]} {year}: P{r["income"]}')
        elif year == three_months_ago.year and month_num >= three_months_ago.month:
            print(f'✓ {r["month"]} {year}: P{r["income"]}')
        else:
            print(f'✗ {r["month"]} {year}: P{r["income"]} (excluded)')
