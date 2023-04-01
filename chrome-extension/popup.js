const OPENAPI_KEY = getCookie("OpenAI Key")
// Login script executes after the page loads
document.addEventListener("DOMContentLoaded", function () {
  const openAIKey = document.getElementById('openaikey');
  const setAIKey = document.getElementById('setopenaikey');
  openAIKey.value = OPENAPI_KEY;
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

  function make_request(api_key, input_text) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.openai.com/v1/chat/completions");
    xhr.setRequestHeader("content-type", "application/json")
    xhr.setRequestHeader("Authorization", "Bearer " + api_key)
    xhr.onload = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        // console.log(xhr.response);
      } else {
        // console.log(`Error: ${xhr.status}`);
      }
    };

    return new Promise(resolve => {
      xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          // console.log(xhr.response);
        } else {
          // console.log(`Error: ${xhr.status}`);
        }
        resolve({
          status: xhr.status,
          response: xhr.responseText
        }
    )};
      xhr.onerror = () => {
        console.log("XHR error")
        resolve({
          status: xhr.status,
          response: xhr.responseText
        }
      )};
      xhr.send(JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": input_text}]
      }));
    })
  };
  // Make a request to the LLM}
  
  // make_request(api_key, "The worlds most original youtube title").then(
  //   (result) => {
  //     console.log("Request finished")
  //     console.log(result)
  // });
  
  Array.from(
    document.querySelectorAll('[id="video-title"]'))
    .forEach(async function (x) {
        try{
          // const replacement = replaceWithLLM(x.innerHTML)
          const text = x.innerHTML.toString()
          const prompt = `I keep on clicking youtube videos that I am not interested in. Take a video title from youtube and make it boring as possible. Do not be overly verbose. Do not say anything other than the title, and do not use quotes. Here is the title: ${text}`
          const replacement = await make_request(api_key, prompt)
          // debugger;
          let replacement_text = JSON.parse(replacement.response).choices[0].message.content
          if (replacement_text[0] == '"' && replacement_text[replacement_text.length-1]=='"') {
            debugger;
            replacement_text = replacement_text.substr(1, replacement_text.length-2)
          }
          console.log("#################################")
          console.log(text)
          console.log(replacement_text)
          x.innerHTML = replacement_text; 
        }
      catch(error){
        console.log(error)
      }
    }
  );

  console.log("I'm on the page")
  return "xx"
}
