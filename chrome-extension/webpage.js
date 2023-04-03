const sleep = time => new Promise(res => setTimeout(res, time, "done sleeping"));
async function onPageLoaded() {
  // chrome.storage.local.clear()
  // await sleep(1000);
  const videos = getTitles()
  console.log(videos)
  for (const video of videos) {
    video['new_title'] = await getVideoTitle(video.id)
    if(video['new_title'] == undefined) {
      video['new_title'] = await make_request(window.OPENAPI_KEY, video.title)
      if (video['new_title'] != ERROR_TEXT) {
        // TODO: Handle storage out of space by clearing the cache
        chrome.storage.local.set({ [video.id]: video['new_title'] })
      } else {
        video['new_title'] = video['title']
      }
    }
    updateWebPage([video])
  }
}

function updateWebPage(videos) {
  const title_htmls = Array.from(document.querySelectorAll('[id="video-title"]'))
  for (const x of title_htmls) {
    const original_title = x.innerHTML.toString()
    for(const video of videos) {
      if(video['title'] == original_title) {
        x.innerHTML = video['new_title']
      }
    }
  }
}

function getTitles() {
  const title_htmls = Array.from(document.querySelectorAll('[id="video-title"]'))
  const videos = []
  for (const x of title_htmls) {
    const original_title = x.innerHTML.toString()
    try {
      let while_counter = 0;
      let parent = x.parentElement;
      while (parent.tagName != "A" && while_counter < 4){
          parent = parent.parentElement;
          while_counter += 1;
      }
      if (while_counter < 4) {
        const parent_href = parent.href.toString();
        let href_array = parent_href.split('watch?v=');
        const suffix = href_array[1]
        if(suffix == undefined) {
          continue;
        }
        const video_id = suffix.split('&')[0];
        videos.push({
          'title': original_title,
          'id': video_id
        })
      }
    } catch(e) {
      console.error(e)
    }
  }
  return videos
}

chrome.storage.sync.get(['activated'], function (storage_1) {
  if(storage_1.activated) {
    chrome.storage.sync.get(['openaikey'], function (storage) {
      window.OPENAPI_KEY = storage.openaikey
      onPageLoaded()
      document.addEventListener("yt-service-request-completed", onPageLoaded);
    });
  }
})