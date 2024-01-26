import sqlite3
conn = sqlite3.connect('your_database.db')
cursor = conn.cursor()

# Execute a SELECT query to retrieve all rows from the table
cursor.execute('SELECT * FROM your_table')
rows = cursor.fetchall()

# List of strings to check against
string_list = ['string1', 'string2', 'string3']

# Iterate through the results
for row in rows:
    # Check if the first element of the row contains any string from the list
    if any(substring in row[0] for substring in string_list):
        # Delete the entire row
        cursor.execute('DELETE FROM your_table WHERE your_primary_key = ?', (row[0],))
        print("Match found and deleted:", row)

conn.commit()
conn.close()
