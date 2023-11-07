from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline

model_name = "deepset/tinyroberta-squad2"

# a) Get predictions
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)



def askQuestion(question, context): 
  return nlp({"question": question, "context": context})["answer"]
print(askQuestion("What is the most successful company in silicon valley?", "Apple is one of the most successful comapanies in silicon valley.")) 