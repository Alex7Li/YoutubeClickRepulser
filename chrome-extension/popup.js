let OPENAPI_KEY = getCookie("OpenAI Key")
console.log("openai key " + OPENAPI_KEY)
// Login script executes after the page loads
document.addEventListener("DOMContentLoaded", function () {
  const openAIKey = document.getElementById('openaikey');
  const setAIKey = document.getElementById('setopenaikey');
  openAIKey.value = OPENAPI_KEY;
  console.log(`OpenAI KEY ${OPENAPI_KEY}`)
  setAIKey.onclick = function () {
    setCookie("OpenAI Key", openAIKey.value);
    OPENAPI_KEY = openAIKey.value;
  }
});

chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
  const activeTab = tabs[0];
  const activeTabId = activeTab.id;
  const cur_url = activeTab.url;
  if (cur_url.match("https?://www.youtube.com/*") == null) {
    throw new Error("Can't generate request: Not a youtube page!")
  }

  return chrome.scripting.executeScript({
    target: { tabId: activeTabId },
    // injectImmediately: true,  // uncomment this to make it execute straight away, other wise it will wait for document_idle
    func: onPageScript,
    args: [OPENAPI_KEY]
  });
}).then(function (results) {
  // console.log(results)
}).catch(function (error) {
  // console.log(error)
});

async function onPageScript(api_key) {
  function make_request(api_key, input_text, type='original') {
    const xhr = new XMLHttpRequest();
    if(type == 'original') {
      xhr.open("POST", "https://api.openai.com/v1/chat/completions");
      xhr.setRequestHeader("content-type", "application/json")
      xhr.setRequestHeader("Authorization", "Bearer " + api_key)
      return new Promise(resolve => {
        xhr.onload = () => {
          if (xhr.status == 200){
            const out_json = JSON.parse(xhr.responseText)
            let message = out_json.choices[0].message.content
            if (message[0] == '"' && message[message.length - 1] == '"') {
              message = message.substr(1, message.length - 2)
            }
            resolve(message)
          } else {
            console.error(`Error ${xhr.status}`)
            resolve(input_text)
          }
        };
        const prompt = `I keep on clicking youtube videos that I am not interested in. Take a video title from youtube and make it boring as possible. Do not say anything other than the title. Be succinct. Here is the title: '${input_text}'`
        xhr.send(JSON.stringify({
          "model": "gpt-3.5-turbo",
          "messages": [{ "role": "user", "content": prompt }]
        }));
      })
    } else if (type == 'fine-tuned') {
      xhr.open("POST", "https://api.openai.com/v1/completions");
      xhr.setRequestHeader("content-type", "application/json")
      xhr.setRequestHeader("Authorization", "Bearer " + api_key)
      return new Promise(resolve => {
        xhr.onload = () => {
          if (xhr.status == 200){
            const out_json = JSON.parse(xhr.responseText)
            let message = out_json.choices[0].text
            if (message[0] == '"' && message[message.length - 1] == '"') {
              message = message.substr(1, message.length - 2)
            }
            resolve(message)
          } else {
            console.error(`Error ${xhr.status}`)
            resolve(input_text)
          }
        };
        xhr.send(JSON.stringify({
          "model": "davinci:ft-personal-2023-04-02-03-29-46",
          "prompt": input_text + "->",
          "stop": "\n"
        }));
      })
    } else {
        throw Error("Invalid request type")
    }
  };

  console.log("ok")
  const title_htmls = Array.from(document.querySelectorAll('[id="video-title"]'))
  let examples = ""
  for (const x of title_htmls) {
    try {
      let while_counter = 0;
          let parent = x.parentElement;
          while (parent.tagName != "A" && while_counter < 4){
              parent = parent.parentElement;
              while_counter += 1;
          }

      if (while_counter < 4){
        const parent_href = parent.href.toString()
        let href_array = parent_href.split('watch?v=');
        const href = href_array[1];
        const original_title = x.innerHTML.toString()
        const new_title = await make_request(api_key, original_title, 'original')
        x.innerHTML = new_title;
        const example = `${original_title}\n${new_title}\n`;
        console.log("###################")
        console.log(href)
        console.log(example);
        examples += example;
      }
    } catch(e) {
      console.error(e)
    }
  }
  console.log("GENERATED EXAMPLES:");
  console.log(examples);
  return "xx"
}
