# import documents from documents.db and load them to ChromaDB Vector library
import re
import pathlib
import chromadb
import os
chromadb_load_boolean=not os.path.exists(f"{pathlib.Path(__file__).parent.resolve()}/chromadb")
client = chromadb.PersistentClient(f"{pathlib.Path(__file__).parent.resolve()}/chromadb")
collection = client.get_or_create_collection(name="collection") #, metadata={"hnsw:space": "cosine"}

import tiktoken
encoding = tiktoken.get_encoding("cl100k_base") #using chatGPT-3.5-turbo's tokenizer for speed, and to avoid Google API rate limit
def count_tokens(string):
    return len(encoding.encode(string))

#if the folder is empty...
if chromadb_load_boolean:
  print('converting documents to embeddings...      (This may take a bit)')
  import sqlite3
  connection = sqlite3.connect('documents.db')
  cursor = connection.cursor()
  cursor.execute("SELECT * FROM documents")

  result = cursor.fetchone()
  id=0
  while result:
  # Word Vectorize Documents
    collection.add(
    documents=[result[1]],
    metadatas=[{"url": result[0]}],
    ids=[f"id{id}"]
    )
    id+=1
    result = cursor.fetchone()
# Close the cursor and connection
  cursor.close()
  connection.close()

def get_documents(prompt,number):
    #shape is [[''],[''],['']] converting to ['','','']
    results=collection.query(query_texts=[prompt], n_results=number)
    documents = [item for sublist in results['documents'] for item in sublist]
    metadatas = [item['url'] for metadata_list in results["metadatas"] for item in metadata_list]

    final_context=""
    total_tokens=0
    for _ in range(len(documents)):
      token_amount=count_tokens(documents[_])
      if(token_amount<=5000 and total_tokens<=10000):
        final_context+='SOURCE:\n'+metadatas[_]+'\n\n'+documents[_]+'\n\n'
        total_tokens+=token_amount
    return final_context

# load Google Gemini API key
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv("API_KEY"))
generation_config = {"temperature": 0}
model = genai.GenerativeModel('gemini-pro',generation_config=generation_config,)

def replace_multiple_line_breaks(text):
    pattern = r"\n{3,}"  # Define the regex pattern to match multiple line breaks
    modified_text = re.sub(pattern, "\n\n", text)  # Replace multiple line breaks with just two line breaks
    return modified_text

def chat_completion(messages):
  if(type(messages)==list):
    from datetime import datetime
    current_date = datetime.now()
    readable_date = current_date.strftime("%A, %B %d, %Y")
    prompts=""
    chat=[{'role':'user','parts':[f'You are a helpful, concise assistant created to help a student attending the College of Dupage (COD). Relate all topics to COD. The current semester is Spring 2024, the date is {readable_date}. Make sure dates are accurate, and do not include links. Say "Okay" if you understand.\n\nHere is the context:\n']},
          {'role':'model','parts':['Okay']},
          {'role':'user','parts':['hello']},
          {'role':'model','parts':["Hello! As a helpful assistant for students attending the College of Dupage, I'm here to help you with any questions or information you may need. How can I assist you today?"]}
          ]
    for message in messages:
      if(message['role']=='user'):
          prompts+=message['text']+'\n'
          chat.append({'role':'user','parts':[message['text']]})
      else:
          chat.append({'role':'model','parts':[message['text']]})
    chat[0]['parts'][0]+=replace_multiple_line_breaks(get_documents(prompts,20))
    chat.pop(-1)
    convo = model.start_chat(history=chat)
    convo.send_message(messages[-1]['text'])
    return(convo.last.text)
  else:
    return "Messages should be a list"
#while True:
#  print(ask_question([{'role':'user','text':input("Question: ")}]))
# What does COD stand for?

from flask import Flask, request, jsonify

app = Flask(__name__)

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Content-Type'] = 'application/json'
    return response

@app.route('/api', methods=['POST', 'OPTIONS'])
def api_endpoint():
    if request.method == 'OPTIONS':
        # Handling OPTIONS request
        
        response = jsonify({"message": "OPTIONS request successful"})
        return add_cors_headers(response), 200

    try:
        request_data = request.get_json()
        return add_cors_headers(jsonify({'message':chat_completion(request_data)})), 200 
    except Exception as e:
        # Handle exceptions if any
        if('safety_ratings' in str(e)):
          return add_cors_headers(jsonify({'message':'Explicit content detected.'})), 200
        print(e)
        response = jsonify({"error": f"{e}"})
        return add_cors_headers(response), 500

app.run(debug=True)
