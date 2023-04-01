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
    // args: ['body']  // you can use this to target what element to get the html for
  });
}).then(function (results) {
  console.log(results)
}).catch(function (error) {
  console.log(error)
});

function onPageScript(selector) {

  // This is for now. We will eventually have a function that will hit the server for the LLM 
  // for each title.
  let replacements = ["Why", "are", "you", "gay"];
  let i = 0;

  function replaceWithLLM(title) {

    // Call the LLM for replacement here. 
      const prompt = `I want you to change the title of this youtube video to not sound like clickbait anymore. But make sure not to change anything if the video title is of a music video. The title of the video is: ${title}`
      const return_string = "C====3"
      return return_string
    };

  Array.from(
    document.querySelectorAll('[id="video-title"]'))
    .forEach(function (x) { 
        try{
          // const replacement = replaceWithLLM(x.innerHTML)
          const replacement = replacements[i%4];
          i += 1;
          x.innerHTML = replacement;
        }
      catch(error){
        console.log(error)
      }
    }
); 

  console.log("I'm on the page")
  return "xx"
}

// Make a request to the LLM
// make_request();