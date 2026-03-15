import json
import pandas as pd

# Load data
with open('data/store_sales.json') as f:
    data = json.load(f)

print("Sample dates and profits:")
for i in range(5):
    rec = data['records'][i]
    print(f"{i+1}. {rec['date']} - Profit: P{rec['totalProfit']:.2f}")

# Analyze monthly aggregation
df = pd.DataFrame(data['records'])
df['month'] = pd.to_datetime(df['date']).dt.to_period('M')
monthly = df.groupby('month')['totalProfit'].sum()

print(f"\nFirst 10 months:")
print(monthly.head(10))

print(f"\nTotal months: {len(monthly)}")
print(f"Best month: {monthly.idxmax()} - P{monthly.max():.2f}")
print(f"Worst month: {monthly.idxmin()} - P{monthly.min():.2f}")
print(f"Average monthly: P{monthly.mean():.2f}")
