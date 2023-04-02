import torch
import transformers
import peft

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

model = transformers.LlamaForCausalLM.from_pretrained(
    'decapoda-research/llama-7b-hf', 
    load_in_8bit=True,
    torch_dtype=torch.float16,
    device_map='auto'
)

tokenizer = transformers.LlamaTokenizer.from_pretrained('decapoda-research/llama-7b-hf')
tokenizer.pad_token_id = 0

model = peft.PeftModel.from_pretrained(
    model,
    '/content/simple-llama-finetuner/lora-banana-date',
    torch_dtype=torch.float16
)

def infer(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")
    input_ids = inputs["input_ids"].to('cuda')

    generation_config = transformers.GenerationConfig(
        do_sample = True,
        temperature = 0.3,
        top_p = 0.1,
        top_k = 50,
        repetition_penalty = 1.5,
        max_new_tokens = 50
    )

    model.eval()
    with torch.no_grad():
        generation_output = model.generate(
            input_ids=input_ids,
            attention_mask=torch.ones_like(input_ids),
            generation_config=generation_config,
        )
        
    output_text = tokenizer.decode(generation_output[0].to(DEVICE))
    return output_text