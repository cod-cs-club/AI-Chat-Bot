from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
model_name = "deepset/tinyroberta-squad2"
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)

def askQuestion(question, context): 
  return nlp({"question": question, "context": context})["answer"]


import sqlite3
# Connect to the SQLite database
connection = sqlite3.connect('documents.db')
# Create a cursor object to execute SQL queries
cursor = connection.cursor()
# Execute a simple query (replace with your own query)
cursor.execute("SELECT * FROM your_table_name")

# Fetch a result
result = cursor.fetchone()
while result:
    # fetch each result at a time
    #send to Eliott's chromaDB function
    result = cursor.fetchone()
# Close the cursor and connection
cursor.close()
connection.close()






from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs

def handle_post_request(request_handler):
    print('Recieved Request')
    # Send a response header
    request_handler.send_response(200)
    request_handler.send_header('Content-type', 'text/plain')
    request_handler.end_headers()

    # Read the POST data
    content_length = int(request_handler.headers['Content-Length'])
    post_data = request_handler.rfile.read(content_length)

    # Customize this part to process the POST data as needed
    response_text = post_data.decode('utf-8')
    
    #get document context here... (Eliott)
    request_handler.wfile.write(askQuestion(response_text,).encode('utf-8'))



def handle_request(request_handler):
    if request_handler.command == 'POST':
        handle_post_request(request_handler)
    
# this sets it up as https://localhost:8000
host = "127.0.0.1"
port = 8000
with HTTPServer((host, port), SimpleHTTPRequestHandler) as httpd:
    print(f"Serving on {host}:{port}")

    # Override the default handle_request method
    httpd.handle_request = lambda: handle_request(httpd)
    httpd.serve_forever()
