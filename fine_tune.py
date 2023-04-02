# import openai
# x = openai.Completion(
#     model="davinci:ft-personal-2023-04-02-03-29-46",
#     prompt="Bridging the Gap Between Research and Practice in Intelligently Bypassing WAF ->"
# )
# print(x)
from transformers import GPT2Tokenizer, GPT2Model
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
model = GPT2Model.from_pretrained('gpt2')
text = "Bridging the Gap Between Research and Practice in Intelligently Bypassing WAF ->"
encoded_input = tokenizer(text, return_tensors='pt')
output = model(**encoded_input)

print(output)