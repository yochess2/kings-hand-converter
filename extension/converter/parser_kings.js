((APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const a = APP_SETTING('archive')

  APP_METHODS.parserKings = {
    fetchUnconvertedHand: fetchUnconvertedHand,
    clickHand: clickHand,
    isFullscreenMask: isFullscreenMask,
    handleFullscreenMask: handleFullscreenMask,
    handleTimeout: handleTimeout,
    closeModal: closeModal
  }

  async function fetchUnconvertedHand(archiveHandElem) {
    const result = {
      text: '',
      lines: [],
      error: null
    }
    clickHand(archiveHandElem)
    let counter = 0
    while (!(isFullscreenMask())) {
      await h.delay(1)
      if (isFullscreenMask()) {
        handleFullscreenMask(result)
        closeModal()
        break
      }
      if (counter > a.timeToDelay) {
        console.log('time out!!!!')
        handleTimeout(result, archiveHandElem)
        closeModal()
        break
      }
      counter++
    }
    return result
  }

  // Double clicks the hand
  function clickHand(elem) {
    elem.dispatchEvent(a.clickEvent)
    elem.dispatchEvent(a.doubleClickEvent)
  }

  // Checks if last element of body is appended with the fullscreen mask div
  function isFullscreenMask() {
    if (!($('body') && $('body')[0] && $('body')[0].lastElementChild)) {
      console.error('Something went wrong with the fullscreen mask looping')
      return false
    }
    return $('body')[0].lastElementChild.className === 'fullscreen_mask'
  }

  // populate result with hand
  function handleFullscreenMask(result) {
    const hhElem = h.getUnreadyElem(['.style_modal_dialog', '.style_hh_list'])[0].children
    for (const line of hhElem) {
      result.lines.push(line.innerText)
      result.text += line.innerText+'\n'
    }
    result.error = false
  }

  // Populate result with archive details
  function handleTimeout(result, elem) {
    result.error = true
    result.text += elem.innerText
  }

  // clicks close button in modal screen
  // TODO: error handling if button does not exist
  function closeModal() {
    const buttonElems = h.getUnreadyElem(['.style_modal_dialog', '.style_button_bar'])
    const button = buttonElems[0].lastElementChild
    if (!(button)) {
      return console.error('BUTTON DOES NOT EXIST!')
    }
    button.click()
  }
})(APP_METHODS, HELPER_METHODS)
