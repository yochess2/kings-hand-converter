chrome.contextMenus.removeAll()
chrome.contextMenus.create({
  "id": "convertHands",
  "title": "Convert Hands",
  "contexts": ["all"]
})

chrome.contextMenus.onClicked.addListener((clickData, tab) => {
  if (clickData.pageUrl !== "https://kingsclubpkr.com/archive.html") {
    chrome.tabs.sendMessage(tab.id, {text: 'rightClicked'}, (text) => {
      console.log(text)
    })
  }
})
