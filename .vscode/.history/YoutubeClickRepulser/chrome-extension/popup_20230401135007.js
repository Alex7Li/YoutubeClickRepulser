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
  const btnLogin = document.getElementById('do-login');
  const btnSignup = document.getElementById('do-signup');
  const btnSetSender = document.getElementById('set-sender');
  const error_textbox = document.getElementById('error-textbox');
  const btnLogout = document.getElementById('logout');

  leaveLoginScreen('me@gmail.com')
  setSender(sender.name)

  btnSetSender.onclick = set_active_user;

  btnLogin.onclick = function () {
    const email = document.getElementById('email-entry').value;
    const password = document.getElementById('password-entry').value;
    window.fetch(
      BASE_URL + "login", {
      method: "POST",
      headers: json_headers,
      body: JSON.stringify({
        "email": email,
        "password": password,
      })
    }).then(response => {
      if (response.status == 200) {
        leaveLoginScreen(email.value)
        error_textbox.innerText = "Login success";
      } else if (response.status == 403) {
        error_textbox.innerText = "Invalid Credentials";
      } else {
        error_textbox.innerText = error + " " + response.status;
      }
    }).catch(error => {
      error_textbox.innerText = error;
    });
  }
  btnSignup.onclick = function () {
    const email = document.getElementById('email-entry').value;
    const password = document.getElementById('password-entry').value;
    const formData = new FormData()
    formData.append('email', email.value)
    formData.append('password1', password.value)
    formData.append('password2', password.value)
    window.fetch(
      BASE_URL + "signup", {
      method: "POST",
      headers: form_headers,
      body: formData
    }).then(response => {
      if (response.status == 200) {
        leaveLoginScreen(email.value)
        return {}
      } else {
        return response.json();
      }
    }).then(response => {
      if (response.errors) {
        error_textbox.innerText = "ERROR: " + " " + response.status + " " + JSON.stringify(response.errors);
      }
    }).catch(error => {
      error_textbox.innerText = error;
    });
  }
  if (btnLogout) { // no logout function for now, we are not doing auth.
    btnLogout.onclick = function () {
      window.fetch(
        BASE_URL + "logout", {
        method: "POST",
        headers: json_headers,
        body: JSON.stringify({
        })
      }).then(response => {
        if (response.status == 200) {
          enterLoginScreen()
        } else {
          error_textbox.innerText = error;
        }
      }).catch(error => {
        error_textbox.innerText = error;
      });
    }
  }

  const emailGen = document.getElementById('generate-email');
  const genText = document.getElementById('generated-text');
  emailGen.onclick = function () {
    const context = document.getElementById('context').value;
    const intent = document.getElementById('intent').value;
    loader.classList.remove("ghost");
    window.fetch(
      BASE_URL + "generate_email_api", {
      method: "POST",
      headers: json_headers,
      body: JSON.stringify({
        "context": context,
        // "character limit": 200, // linkedin character limit
        "intent": intent,
        "reciever": reciever,
        "sender": sender
      })
    }
    ).then(response => {
      // const llm_text = "Hello honorable sir. It would be my greatest pleasure to gain from you the honor of an accepted linkedIn request. My perennial dream has been to befriend you on linkedIn, and thenceforth never interact."
      return response.json();
    }).then(response => {
      const llm_text = response.response_text
      genText.rows = parseInt(3 + (llm_text.length / 32))
      genText.innerHTML = llm_text;
      genText.placeholder = "generated text. Wait, why'd you delete it?!?";
      loader.classList.add("ghost");
    }).catch(error => {
      console.error(error)
      error_textbox.innerText = error;
      loader.classList.add("ghost");
    });
  };
  window.fetch(
    BASE_URL + "is_logged_in", {
    method: "GET",
    headers: json_headers,
  }).then(response => {
    return response.json();
  }).then(response => {
    if (response.email) {
      leaveLoginScreen(response.email)
    }
    // not logged in
  }).catch(error => {
    console.error(error)
  });
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
