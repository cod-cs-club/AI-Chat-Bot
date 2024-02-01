# Retired code for HuggingFace open source model
# import and prepare AI Model
#from transformers import pipeline
#model_name = "deepset/roberta-base-squad2"
#nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)

#return nlp({"question": question, "context": get_documents(question,3)})["answer"]


start_time=time.time()
count_amount=0
def count_tokens(text): #function to make sure to stay within Google's API limit (3000 queries per minute)
    global start_time, count_amount
    if(time.time() - start_time >= 60):
       count_amount=0
       start_time=time.time()
    if(count_amount==250):
       time.sleep((time.time() - start_time)/1000)
    return int(''.join(filter(str.isdigit, str(model.count_tokens(text)))))




# this method works but not as well as using chat_completion
def ask_question(messages):
  # messages.append({'role':'User','text':question})
  prompts=""
  chat_history=""
  if(type(messages)==list):
    for message in messages:
      chat_history+=message['role']+": "+message['text']+'\n'
      if(message['role']=='user'):
        prompts+=message['text']+'\n' # If you do not know an answer, tell the user "I'm sorry I cannot find that information online."
    prompt=f"""You are a helpful assistant created to help a student attending the College of Dupage (COD).

{chat_history}
    
Here is the context:
  \"\"\"{get_documents(prompts)}\"\"\""""
    #print(get_documents(prompt,20))
    #model.count_tokens("why is sky blue?")
    #return get_documents(prompts,30)
    return model.generate_content(prompt).text
  else:
     return "Messages should be a list"
