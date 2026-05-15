chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  const url = changeInfo.url || tab?.url;

  if (changeInfo.url && url.includes('youtube.com/watch')) {
    const queryParameters = url.split('?')[1];
    const urlParameters = new URLSearchParams(queryParameters);

    console.log(urlParameters);


    chrome.tabs.sendMessage(tabId, {
      type: 'NEW',
      videoId: urlParameters.get('v'),
    });
  }

});