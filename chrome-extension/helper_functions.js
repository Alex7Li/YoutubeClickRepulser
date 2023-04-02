// Cookies are used to store the openAI key
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  // 1000 day expiration
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

// video summaries are cached in chrome storage
function setVideoTitle(hash, title) {
  chrome.storage.local.set({ [hash]: title }).then(() => {
    console.log(`Value of ${hash} is set to ${summary}`);
  });
}
async function getVideoTitle(hash) {
  return await chrome.storage.local.get([hash])
}
