// Cookies are used to store the openAI key
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  // 1000 day expiration
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const ERROR_TEXT = "YoutubeClickRepulserError"
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

async function getOpenAIKey() {
  x = await chrome.storage.sync.get(['openaikey'])
  return x['openaikey']
}
// video summaries are cached in chrome storage
async function getVideoTitle(hash) {
  x = await chrome.storage.local.get([hash]).catch((e)=>console.log(`cache miss ${hash}`))
  return x[hash]
}

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
          console.log(`Error ${xhr.status}`)
          resolve(ERROR_TEXT)
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
          resolve(ERROR_TEXT)
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