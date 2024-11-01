import pandas as pd

# Read the Parquet file
df = pd.read_parquet('database/customers_data_1.pq', engine='pyarrow')

# Save to CSV
df.to_csv('database/customers_data_1.csv', index=False)
