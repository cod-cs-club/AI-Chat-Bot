#Import ChromaDB and inititate chroma client

import chromadb

chroma_client = chromadb.Client()

#Init ChromaDB collection
#chroma_client.delete_collection(name="testCollection")
testCollection = chroma_client.create_collection(name="testCollection")

#Add test documents to test collection

testCollection.add(
    documents=["Humans have always been fascinated by the mysteries of space. Landmarks like the 1969 moon landing and Mars exploration continue to inspire us. Future missions, like the search for extraterrestrial life, kindle our desire to explore the universe.", "Agriculture is evolving to be more eco-friendly. Practices such as organic farming and precision agriculture help us feed a growing population while conserving resources. Sustainable farming ensures nutritious food for future generations.", "Artificial intelligence is reshaping healthcare. AI aids in diagnostics, predictions, and robotics, making healthcare more accurate and efficient. This integration promises improved patient care and reduced workload for medical professionals."],
    metadatas=[{"source": "my_source"}, {"source": "my_source"}, {"source": "my_source"}],
    ids=["id1", "id2", "id3"]
)

def queryPrompt(prompt,collection,results):
    results = collection.query(query_texts=[prompt], n_results=results)
    return results['documents']


print(queryPrompt("How should I improve the yeild of my farms?",testCollection,1))