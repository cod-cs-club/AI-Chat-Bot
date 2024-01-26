import os 
if not os.path.exists('documents'):
    os.makedirs('documents')

import sqlite3
connection = sqlite3.connect('documents.db')
cursor = connection.cursor()
cursor.execute("SELECT * FROM documents")

result = cursor.fetchone()
while result:
    file=open("documents/"+result[0].replace(':', '_').replace('/', '_').replace('.', '_').replace('?', '_')+".txt", 'w', encoding='utf-8')
    file.write(result[1])
    file.close()
    result = cursor.fetchone()
# Close the cursor and connection
cursor.close()
connection.close()
