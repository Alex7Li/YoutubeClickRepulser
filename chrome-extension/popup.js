// Login script executes after the page loads
document.addEventListener("DOMContentLoaded", async function () {
  const openAIKey = document.getElementById('openaikey');
  const setAIKey = document.getElementById('setopenaikey');
  openAIKey.value = await getOpenAIKey();
  console.log(`OpenAI KEY ${openAIKey.value}`)
  setAIKey.onclick = async function () {
    console.log("abcd")
    await chrome.storage.sync.set({openaikey: openAIKey.value})
    openAIKey.value = await getOpenAIKey();
    console.log("abc")
  }
});
