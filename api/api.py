import flask
from flask import request, jsonify

# import llm_inference

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return '''<h1>Distant Reading Archive</h1>
<p>A prototype API for distant reading of science fiction novels.</p>'''


@app.route('/api/inference', methods=['GET','POST'])
def api_all():
    
    if 'title' in request.args:
        title = request.args['title']
    else:
        return "Error: No title field provided. Please specify a title."
    
    # prompt = f'task: change an exaggerated youtube title to a neutral title. exaggerated: "{title}"\nneutral: '
    # output_text = llm_inference.infer(prompt)
    # output = jsonify({"new_title": output_text.split('\nneutral: ')})
    
    output = jsonify(new_title="This is a boring title", old_title=title)
    
    
    return output
    

if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=True)