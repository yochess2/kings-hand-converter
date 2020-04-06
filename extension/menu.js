chrome.contextMenus.removeAll()
chrome.contextMenus.create({
  "id": "convertHands",
  "title": "Convert Hands",
  "contexts": ["all"]
})

chrome.contextMenus.onClicked.addListener((clickData, tab) => {
  if (clickData.pageUrl.match("kingsclubpkr.com/archive.html")) {
    chrome.tabs.sendMessage(tab.id, {text: 'rightClicked'}, (text) => {
      console.log(text)
    })
  }

  if (clickData.pageUrl.match("ourneighborhoodclub.com/myaccount/HandHistory.asp")) {
    chrome.tabs.sendMessage(tab.id, {text: 'ONC'}, (text) => {
      console.log(text)
  	})
  }
})
