import pandas as pd

df = pd.read_csv('data_comma_sep.csv')

with open('parse.txt', 'w') as f:
    for i, row in df.iterrows():
        f.write('clickbait: {}\nneutral: {}\n\n\n'.format(row.prompt, row.completion))