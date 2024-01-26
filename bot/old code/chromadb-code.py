import chromadb
chroma_client = chromadb.Client()
documentCollection = chroma_client.create_collection(name="testCollection")

#Add test documents to test collection
documentCollection.add(
    documents=["Humans have always been fascinated by the mysteries of space. Landmarks like the 1969 moon landing and Mars exploration continue to inspire us. Future missions, like the search for extraterrestrial life, kindle our desire to explore the universe.", "Agriculture is evolving to be more eco-friendly. Practices such as organic farming and precision agriculture help us feed a growing population while conserving resources. Sustainable farming ensures nutritious food for future generations.", "Artificial intelligence is reshaping healthcare. AI aids in diagnostics, predictions, and robotics, making healthcare more accurate and efficient. This integration promises improved patient care and reduced workload for medical professionals."],
    metadatas=[{"source": "link1"}, {"source": "link2"}, {"source": "link3"}],
    ids=["1", "2", "3"]
)

def queryPrompt(prompt,collection,results):
    results = collection.query(query_texts=[prompt], n_results=results)
    return results['documents']
#example usage --> query, documents, number of top results to return
print(queryPrompt("How should I improve the yeild of my farms?",documentCollection,5))