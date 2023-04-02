// Login script executes after the page loads
document.addEventListener("DOMContentLoaded", async function () {
  const openAIKey = document.getElementById('openaikey');
  
  const setAIKey = document.getElementById('setopenaikey');
  openAIKey.value = await getOpenAIKey();
  setAIKey.onclick = async function () {
    await chrome.storage.sync.set({openaikey: openAIKey.value})
  }
  
  const activated = document.getElementById('activated');
  let isActivated = await chrome.storage.sync.get(['activated'])
  isActivated = isActivated['activated']
  console.log(isActivated)
  if(isActivated == undefined) {
    isActivated = false;
  }
  activated.checked = isActivated;
  activated.value = isActivated['activated']
  activated.onclick = async function () {
    console.log('checked')
    console.log(activated.checked)
    await chrome.storage.sync.set({activated: activated.checked})
  }
});