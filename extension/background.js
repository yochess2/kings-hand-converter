chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.text === 'download') {
    let convertedBlob = new Blob([msg.str], {type: "text/plain;charset=utf-8"})
    var url = URL.createObjectURL(convertedBlob);
    chrome.downloads.download({
      url: url,
      filename: 'HH',
      saveAs: true
    })
  }
})