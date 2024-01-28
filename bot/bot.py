# import documents from documents.db and load them to ChromaDB Vector library
import pathlib
import chromadb
import os
chromadb_load_boolean=not os.path.exists(f"{pathlib.Path(__file__).parent.resolve()}\chromadb")
client = chromadb.PersistentClient(f"{pathlib.Path(__file__).parent.resolve()}\chromadb")
collection = client.get_or_create_collection(name="collection", metadata={"hnsw:space": "cosine"})

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

def get_documents(prompt,results):
    #shape is [[''],[''],['']] converting to ['','','']
    documents = [item for sublist in collection.query(query_texts=[prompt], n_results=results)['documents'] for item in sublist]
    return '\n\n'.join(documents)

# load Google Gemini API key
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def ask_question(messages):
  #messages.append({'role':'User','text':question})
  prompts=""
  chat_history=""
  if(type(messages)==list):
    for message in messages:
      chat_history+=message['role']+": "+message['text']+'\n'
      if(message['role']=='user'):
        prompts+=message['text']+'\n'
    prompt=f"""You are a helpful assistant created to help a student attending the College of Dupage. If you do not know an answer, tell the user "I'm sorry I cannot find that information online.".

{chat_history}     
    
Here is the context:
  \"\"\"{get_documents(prompts,20)}\"\"\"\n\n"""
    #print(get_documents(prompt,20))
    #model.count_tokens("why is sky blue?")
    return model.generate_content(prompt).text
  else:
     return "Messages should be a list"

#while True:
#  print(ask_question([{'role':'user','text':input("Question: ")}]))
# What does COD stand for?

from flask import Flask, request, jsonify
app = Flask(__name__)
@app.route('/api', methods=['POST'])
def api_endpoint():
    try:
        request_data = request.get_json()
        return ask_question(request_data.messages), 200

    except Exception as e:
        # Handle exceptions if any
        error_message = {"error": str(e)}
        return jsonify(error_message), 500

app.run(debug=True)