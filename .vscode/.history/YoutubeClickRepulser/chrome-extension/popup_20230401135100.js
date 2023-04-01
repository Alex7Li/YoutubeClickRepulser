const BASE_URL = "http://localhost:8000/"
// const BASE_URL = "http://hyperai.tech:8000/"
const json_headers = new Headers();

json_headers.append('Accept', 'application/json');
json_headers.append('Content-Type', 'application/json');
// json_headers.append('Origin', 'chrome-extension://oegdbnpkbegpcnbhmohdngdknpdbejhi');

const form_headers = new Headers();
form_headers.append('Accept', 'application/json');
form_headers.append('Content-Type', 'application/x-www-form-urlencoded');
// form_headers.append('Origin', 'chrome-extension://oegdbnpkbegpcnbhmohdngdknpdbejhi');

function setLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
function getLocalStorage(key) {
  return JSON.parse(window.localStorage.getItem(key))
}
let reciever = {};
let sender = getLocalStorage('sender')
if (sender == null) {
  sender = {
    'name': "Anonymous",
    'experience': [],
    'education': []
  };
}

const doneLoading = (event) => {
  if (Object.keys(reciever).length != 0) {
    const emailGen = document.getElementById('generate-email');
    emailGen.classList.remove("disabled")
  }
}

const enterLoginScreen = function () {
  const user_info = document.getElementById('user-info');
  const loginScreen = document.getElementById('login');
  const pluginScreen = document.getElementById('plugin');
  user_info.innerText = ""
  loginScreen.classList.remove("ghost")
  pluginScreen.classList.add("ghost")
}

const setSender = function (sender) {
  const senderInfo = document.getElementById('sender-info');
  if (sender == "") {
    senderInfo.innerText = "Go to your linkedIn page to set yourself as the sender"
  } else {
    senderInfo.innerText = "Sending message as: " + sender + "."
  }
}

const leaveLoginScreen = function (email) {
  const user_info = document.getElementById('user-info');
  const loginScreen = document.getElementById('login');
  const pluginScreen = document.getElementById('plugin');
  // user_info.innerText = "Logged in as " + email + "."
  loginScreen.classList.add("ghost")
  pluginScreen.classList.remove("ghost")
}


// Login script executes after the page loads
document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById('loader');
});

chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
  const activeTab = tabs[0];
  const activeTabId = activeTab.id;
  const cur_url = activeTab.url;
  console.log("SETTING RECEIVER")
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
  console.log("I'm on the page")
  return "xx"
}
