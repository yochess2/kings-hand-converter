((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const d = APP_SETTING('display')
  const s = APP_SETTING('store')
  const p = APP_METHODS.parser
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.text === 'rightClicked') {
      handleClick(s.starting_hand_num, s.ending_hand_num)
      sendResponse('performing operation')
    }
  })

  // FUNCTION 1
  async function handleClick(startNum, endNum) {
    const app = await initApp(startNum, endNum)
    if (app.error.val) {
      return alert(app.error.text)
    }
    const hasResults = await processArchive(
      app.archiveHandElems,
      app.displays,
      parseInt(app.store[startNum]),
      parseInt(app.store[endNum])
    )
    closeAppDocuments(app.displays, hasResults)
  }

  // FUNCTION 1.1
  async function initApp(startNum, endNum) {
    const app = {
      error: {
        val: false
      },
      store: await h.getStorage([startNum, endNum]),
      archiveHandElems: h.getUnreadyElem(['.style_hh_workspace', '.lc_list'])[0].children,
      displays: {
        handHistory: h.makeDisplay(d.handHistory.url, '', d.handHistory.specs),
        unconverted: h.makeDisplay(d.unconverted.url, '', d.unconverted.specs)
      }
    }
    if (!(h.inputConditions(app.store[startNum], app.store[endNum]))) {
      h.setError(app.error, true, "Something wrong with popup.js")
      return app
    }
    if (!(app.archiveHandElems)) {
      h.setError(app.error, true, "Something wrong with the hands")
      return app
    }
    return app
  }

  // FUNCTION 1.2
  async function processArchive(archiveHandElems, displays, startNum, endNum) {
    let counter = 0, hasResults = false
    let currentNum, beforeNum
    for (const archiveHandElem of archiveHandElems) {
      if (!(validHand(archiveHandElem))) {
        continue
      }
      currentNum = getCurrentArchiveHandNum(archiveHandElem)
      if (skipHand(currentNum, beforeNum, startNum)) {
        continue
      }
      if (isLastHand(endNum, currentNum)) {
        break
      }
      beforeNum = currentNum
      const unconvertedHand = await p.fetchUnconvertedHand(archiveHandElem)
      const convertedHand = convertHand(unconvertedHand)
      printHand(unconvertedHand, convertedHand, displays, counter)
      isProcessed = true
      counter++
    }
    return hasResults
  }

  // FUNCTION 1.3: Close Displays when done
  function closeAppDocuments(displays, hasResults) {
    if (hasResults) {
      displays.handHistory.document.write('<pre/>')
      displays.unconverted.document.write('<pre/>')
    }
    displays.handHistory.document.close()
    displays.unconverted.document.close()
  }

    ////// Helper //////
   /* processArchive */
  ///// METHODS //////

  // Gets the hand number of the archive hand
  function getCurrentArchiveHandNum(elem) {
    return parseInt(elem.children[1].innerText)
  }

  // Checks if hand elem is not broken
  function validHand(elem) {
    return elem.children && elem.children[1] && elem.children[1].innerText
  }

  // 2 conditions
  //   - currentNum is equal to the # from hand before (takes care of +50 glitch)
  //   - startingNum is still smaller than the # from the 1st hand
  function skipHand(currentNum, beforeNum, startNum) {
    return ((currentNum === beforeNum) || (startNum < currentNum))
  }

  // Checks If current hand num is less than endNum
  function isLastHand(endNum, currentNum) {
    return endNum > currentNum
  }

  function printHand(uncovertedHand, convertedHand, displays, counter) {
    if (counter === 0) {
      displays.unconverted.document.body.innerHTML = ''
      displays.unconverted.document.title = d.unconverted.title
      displays.unconverted.document.write('<pre>')
      displays.handHistory.document.body.innerHTML = ''
      displays.handHistory.document.title = d.unconverted.title
      displays.handHistory.document.write('<pre>')
      h.hookAlert()
      h.hookAlert(displays.unconverted)
      h.hookAlert(displays.handHistory)
    }
    if (convertedHand.display === true) {
      displays.handHistory.document.write(convertedHand.text)
      displays.handHistory.document.write('\n')
    } else {
      displays.unconverted.document.write(uncovertedHand.text)
      displays.unconverted.document.write('\n')
    }
  }
})(APP_SETTING, APP_METHODS, HELPER_METHODS)
