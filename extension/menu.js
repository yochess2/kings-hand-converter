chrome.contextMenus.removeAll()
chrome.contextMenus.create({
  "id": "convertHands",
  "title": "Convert Hands",
  "contexts": ["all"]
})

chrome.contextMenus.onClicked.addListener((clickData, tab) => {
  console.log('1. right click works')
  if (clickData.pageUrl.match("kingsclubpkr.com/archive.html") || 
    clickData.pageUrl.match("kingshomegames.com/archive.html")) {
    console.log('2. matching works')
    chrome.tabs.sendMessage(tab.id, {text: 'rightClicked'}, (text) => {
      console.log('3. message sent', text)
    })
  }

  if (clickData.pageUrl.match("ourneighborhoodclub.com/myaccount/HandHistory.asp")) {
    chrome.tabs.sendMessage(tab.id, {text: 'ONC'}, (text) => {
      console.log(text)
  	})
  }
})
