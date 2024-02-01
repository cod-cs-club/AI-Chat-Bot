#The average token count is: 1574.4411512946715

import os
import re
import time
import sqlite3
connection = sqlite3.connect('documents.db')
cursor = connection.cursor()
cursor.execute("SELECT * FROM documents")
result = cursor.fetchone()

import tiktoken
encoding = tiktoken.get_encoding("cl100k_base") #using chatGPT-3.5-turbo's tokenizer for speed, and to avoid Google API rate limit
def count_tokens(string):
    return len(encoding.encode(string))
  
average=0
count=0

while result:
    count+=1
    average+=count_tokens(result[1])
    result = cursor.fetchone()

print(f"The average token count is: {average/count}")
cursor.close()
connection.close()