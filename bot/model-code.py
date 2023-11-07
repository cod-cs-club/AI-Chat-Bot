from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
model_name = "deepset/tinyroberta-squad2"
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)

def askQuestion(question, context): 
  return nlp({"question": question, "context": context})["answer"]

#Example Usage
#print(askQuestion("What is the most successful company in silicon valley?", "Apple is one of the most successful comapanies in silicon valley."))
#Apple