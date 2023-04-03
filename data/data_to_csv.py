import pandas
import openai
import os
from tqdm import tqdm
import time
tqdm.pandas()

data=pandas.read_csv('data/data_tab_sep.csv', sep='\t')
data['prompt'] = "[Clickbait]: " + data['prompt'] + " [Unassuming and Terse]:  "
data.to_csv('data/data_comma_sep.csv', index=False, sep=',')
def autogen_labels_for_data():
    title_data = pandas.read_csv('data/videos-stats.csv')
    title_data['prompt'] = title_data['Title']
    counter = 0
    def get_completion(row):
        global counter
        counter += 1
        if counter % 100 == 0:
            print(counter, flush=True)
        time.sleep(1.01) # avoid the rate limit of 60/min
        prompt = f'I keep on clicking youtube videos that I am not interested in. Take a video title from youtube and make it boring as possible. Do not say anything other than the title. Be succinct. Here is the title: "{row["prompt"]}"'
        try:
            openai.api_key = os.getenv("OPENAI_API_KEY")
            x = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        'role': "user",
                        'content': prompt
                    }
                ],
                temperature=0,
            )
            result = x['choices'][0]['message']['content']
            if result[0] == result[-1] == '"' or result[0] == result[-1] == "'" :
                result = result[1:-1]
            print(f"{row['prompt']}\t{result}", flush=True)
            return result
        except Exception as e:
            print(counter)
            print(e)
            print("Failed")
            return "ERROR: THE MODEL FAILED TO EXECUTE"

    title_data.drop(title_data.columns.difference(['prompt']), 1, inplace=True)
    title_data['completion'] = title_data.apply(get_completion, axis=1)
    title_data.to_csv('data/data_comma_sep_auto.csv', index=False)

# BASH COMMANDS AFTER RUNNING:
# openai tools fine_tunes.prepare_data -f data/data_merged.csv 
# openai api fine_tunes.create -t data/data_merged_prepared.jsonl -m ada
# openai tools fine_tunes.prepare_data -f data/data_comma_sep.csv 
# openai api fine_tunes.create -t data/data_merged_prepared.jsonl -m ada

# LOGS
# davinci, just 250 dataset
# Uploaded file from data_comma_asep_prepared.jsonl: file-h19cTjKHGTPkDYhj7drjH7nv
#   openai api fine_tunes.follow -i ft-F2Kp9YQKmLPXspBTAQl6Al2X
# openai api completions.create -m davinci:ft-personal-2023-04-02-03-29-46 -p <YOUR_PROMPT>

# ada, 2k dataset
# Uploaded file from data_merged_prepared.jsonl: file-IMZFFCVgxY6h5MQ03rZ4RniP
# [2023-04-02 21:08:30] Created fine-tune: ft-siX8M1mgb3sg2Qcz7B7llGtR
# openai api completions.create -m ada:ft-personal-2023-04-03-01-22-26 -p <YOUR_PROMPT>

# curie, just 250 dataset
# Uploaded file from data_comma_asep_prepared.jsonl: file-h19cTjKHGTPkDYhj7drjH7nv
#   openai api fine_tunes.follow -i ft-F2Kp9YQKmLPXspBTAQl6Al2X
# openai api completions.create -m davinci:ft-personal-2023-04-02-03-29-46 -p <YOUR_PROMPT>