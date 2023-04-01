function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
// Use this function once to set the openAI key.
// setCookie("OpenAI Key", "YOUR_OPENAI_KEY")
const OPENAPI_KEY = getCookie("OpenAI Key")
console.log("A")
function make_request() {
  console.log("B")
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.openai.com/v1/chat/completions");
  xhr.setRequestHeader("content-type", "application/json")
  xhr.setRequestHeader("Authorization", "Bearer " + OPENAPI_KEY)
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.response);
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
  console.log(xhr)

  xhr.send(JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }))
}