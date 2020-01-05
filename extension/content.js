chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.text === 'rightClicked') {
    chrome.storage.sync.get(['starting-hand-num', 'ending-hand-num'], storage => {
      handleClick(storage['starting-hand-num'], storage['ending-hand-num'])
    })
    sendResponse('performing operation')
  }
})

function handleClick(startNum, endNum) {
  console.log('working!')
}
