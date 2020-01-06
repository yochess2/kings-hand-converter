((APP_SETTING,HELPER_METHODS) => {
  const h = HELPER_METHODS()
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.text === 'rightClicked') {
      const s = APP_SETTING('store')
      handleClick(s.starting_hand_num, s.ending_hand_num)
      sendResponse('performing operation')
    }
  })

  async function handleClick(startNum, endNum) {
    const store = await h.getStorage([startNum, endNum])
    if (!(h.inputConditions(store[startNum], store[endNum]))) {
      return
    }
    processArchive(parseInt(store[startNum]), parseInt(store[endNum]))
  }

  // Give Summary
  async function processArchive(startNum, endNum) {
    const archiveHandElems = getUnreadyElem(['.style_hh_workspace', '.lc_list'])[0].children //need error handling
    if (!(archiveHandElems)) {
      alert('There are no hands!')
      return
    }
    const a = APP_SETTING('archive')

    //Open new window
    const newWindow = window.open(
      'hand_history.html',
      '',
      'width=400,height=400,resizeable,scrollbars'
    )
    newWindow.onbeforeunload = function (e) {
      e = e || window.event
        return 'Sure?'
    }
    window.onbeforeunload = function (e) {
      e = e || window.event
        return 'Sure?'
    }

    // TODO: Study promises with higher order function loops
    let currentNum, beforeNum
    let counter = 0
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
      const hand = await fetchUnconvertedHand(archiveHandElem, a)
      counter++
      //HERE IS WHERE I LEFT OFF
      if (counter === 1) {
        newWindow.document.title = 'unconverted hands'
      }
      newWindow.document.write('<pre>')
      newWindow.document.write(hand.text)
      newWindow.document.write('\n')
    }
  }

  // Give Summary and Modularize
  async function fetchUnconvertedHand(elem, a) {
    const result = {
      text: '',
      error: true
    }
    elem.dispatchEvent(a.clickEvent)
    elem.dispatchEvent(a.doubleClickEvent)
    let ms = 0
    while ($('body')[0].lastElementChild.className !== "fullscreen_mask") { //need error handling
      await h.delay(10)
      if (ms > 5000) {
        break
      }
      ms++
    }
    if (ms > 5000) {
      return result
    }
    result.error = false
    const hhElem = getUnreadyElem(['.style_modal_dialog', '.style_hh_list'])
    // hhElem[0].children won't work!?
    const buttonElems = getUnreadyElem(['.style_modal_dialog .style_button_bar'])
    const button = buttonElems[0].lastElementChild //need error handling
    result.text += hhElem[0].innerText //need error handling
    button.click()
    return result
  }

  // Gets element via jQuery
  // Returns in some weird array format
  function getUnreadyElem(arr) {
    const elem = $(arr.join(' '))
    if (!(elem) || !(elem)[0]) {
      return []
    }
    return elem
  }

  // Gets the hand number of the archive hand
  function getCurrentArchiveHandNum(elem) {
    return parseInt(elem.children[1].innerText)
  }

  function clickHand(elem, a) {
    elem.dispatchEvent(a.clickEvent)
    elem.dispatchEvent(a.doubleClickEvent)
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
})(APP_SETTING, HELPER_METHODS)
