import pandas
import openai
import os
from tqdm import tqdm
import time
tqdm.pandas()

data=pandas.read_csv('data_tab_sep.csv', sep='\t')
data.to_csv('data_comma_sep.csv', index=False)


title_data = pandas.read_csv('videos-stats.csv')
title_data['prompt'] = title_data['Title']
counter = 0
def get_completion(row):
    global counter
    counter+=1
    if counter % 100 == 0:
        print(counter, flush=True)
    time.sleep(1.01) # avoid the rate limit of 60/min
    prompt = f'I keep on clicking youtube videos that I am not interested in. Take a video title from youtube and make it boring as possible. Do not say anything other than the title. Be succinct. Here is the title: "{row["prompt"]}"'
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

title_data.drop(title_data.columns.difference(['prompt']), 1, inplace=True)
title_data['completion'] = title_data.progress_apply(get_completion, axis=1)
title_data.to_csv('data_comma_sep_auto.csv', index=False)

# BASH COMMANDS AFTER RUNNING:
# openai tools fine_tunes.prepare_data -f data_comma_sep.csv 
# openai api fine_tunes.create -t data_comma_sep_prepared.jsonl -m davinci

# LOGS
# Upload progress: 100%|█████████████████████████████████████████████████████████████| 32.6k/32.6k [00:00<00:00, 26.7Mit/s]
# Uploaded file from data_comma_asep_prepared.jsonl: file-h19cTjKHGTPkDYhj7drjH7nv
# Created fine-tune: ft-F2Kp9YQKmLPXspBTAQl6Al2X
# Streaming events until fine-tuning is complete...

# (Ctrl-C will interrupt the stream, but not cancel the fine-tune)
# [2023-04-01 23:10:43] Created fine-tune: ft-F2Kp9YQKmLPXspBTAQl6Al2X
# Stream interrupted (client disconnected).
# To resume the stream, run:

#   openai api fine_tunes.follow -i ft-F2Kp9YQKmLPXspBTAQl6Al2X