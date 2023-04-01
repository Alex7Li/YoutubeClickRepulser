const leaveLoginScreen = function (email) {
  const hello = document.getElementById('hello');
}

// Login script executes after the page loads
document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById('loader');
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
  console.log(results)
}).catch(function (error) {
  console.log(error)
});

function onPageScript(api_key) {

  function make_request(api_key, input_text) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.openai.com/v1/chat/completions");
    xhr.setRequestHeader("content-type", "application/json")
    xhr.setRequestHeader("Authorization", "Bearer " + api_key)
    xhr.onload = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.response);
      } else {
        console.log(`Error: ${xhr.status}`);
      }
    };

    return new Promise(resolve => {
      xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          console.log(xhr.response);
        } else {
          console.log(`Error: ${xhr.status}`);
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
  }
  // Make a request to the LLM}
  make_request(api_key, "The worlds most original youtube title").then(
    (result) => {
      console.log("Request finished")
      console.log(result)
  });
  // This is for now. We will eventually have a function that will hit the server for the LLM 
  // for each title.
  let replacements = ["This", "is", "working"];
  let i = 0;
  Array.from(
    document.querySelectorAll('[id="video-title"]'))
    .forEach(function (x) {
        try{
          x.innerHTML=replacements[i%3]; i = i+1;
        }
      catch(error){
        console.log(error)
      }
    }
); 

  console.log("I'm on the page")
  return "xx"
}
