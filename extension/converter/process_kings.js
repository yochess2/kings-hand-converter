((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const p = APP_METHODS.parserKings
  const a = APP_SETTING('archive')

  APP_METHODS.processKings = {
  	processArchive: processArchive
  }

  async function processArchive(archiveHandElems, downloadWin, htmlElems, startNum, endNum, autoClick) {
    let it = {
      counter: 0,
      startNum: startNum,
      endNum: endNum,
      originalStr: '',
      convertedStr: '',
      unConvertedStr: '',
      isStop: false
    }
    htmlElems.stop.onclick = () => {
      it.isStop = true
    }
    await loopIt(archiveHandElems, it, htmlElems, 0)
    if ((autoClick === 'yes') && (!(it.error))) {
      await plusFiddy(archiveHandElems, it, htmlElems)
    }
    createButtons(htmlElems, it)
  }

  async function loopIt(archiveHandElems, it, htmlElems, lastIndex) {
    for (let i = lastIndex; i < archiveHandElems.length; i++) {
      let archiveHandElem = archiveHandElems[i]
      if (it.isStop) { break }
      if (!(validHand(archiveHandElem))) { continue }
      it.currentNum = getCurrentArchiveHandNum(archiveHandElem)
      if (duplicateHand(it.currentNum, it.beforeNum)) {
        htmlElems.d.innerHTML = parseInt(htmlElems.d.innerHTML) + 1
        continue
      }
      if (greaterThan(it.currentNum, it.startNum)) {
        it.beforeNum = it.currentNum
        continue
      }
      if (isLastHand(it.endNum, it.currentNum)) {
        break
      }
      // const unconvertedHand = await p.fetchUnconvertedHand(archiveHandElem, htmlElems.lag)
      const unconvertedHand = await p.fetchUnconvertedHand_2(archiveHandElem, htmlElems.lag)
      if (unconvertedHand.error) {
        it.error = true
        break
      }

      it.originalStr += unconvertedHand.text + '\n'
      const convertedHand = convert(unconvertedHand)
      if (convertedHand.display === true) {
        it.convertedStr += convertedHand.text + '\n'
        htmlElems.c.innerHTML = parseInt(htmlElems.c.innerHTML) + 1
      } else {
        it.unConvertedStr += unconvertedHand.text + '\n'
        htmlElems.u.innerHTML = parseInt(htmlElems.u.innerHTML) + 1
      }
      htmlElems.l.innerHTML = it.currentNum
      it.beforeNum = it.currentNum
      it.looped = true
    }
  }

  async function plusFiddy(archiveHandElems, it, htmlElems) {
    const elem_fiddy = document.getElementsByClassName('style_button style_banner_button')[0]
    let elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
    let hand_count = elem_hand_count.innerHTML
    let outer_counter = 0
    let last_index = archiveHandElems.length
    while (!(isLastHand(it.endNum, it.currentNum)) && !(it.error) && !(it.isStop)) {
      let inner_counter = 0
      hand_count = elem_hand_count.innerHTML // 50
      elem_fiddy.click()
      while ((hand_count === elem_hand_count.innerHTML) && (!(it.isStop)) && !(it.error)) {
        elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
        htmlElems.lag.innerHTML = `${parseInt(inner_counter/100)}/${a.timeToDelay/100}`
        if (inner_counter > a.timeToDelay) {
          it.error = true
          htmlElems.lag.innerHTML = `TIME OUT`
        }
        await h.delay(1)
        inner_counter++
      }
      htmlElems.hc.innerHTML = archiveHandElems.length
      await h.delay(1)
      it.looped = false
      await loopIt(archiveHandElems, it, htmlElems, last_index)
      last_index += 50
      if (!(it.looped)) {
        h.delay(2000)
      }
      outer_counter++
    }
  }

  function createButtons(htmlElems, it) {
    const cBtn = document.createElement("BUTTON")
    const uBtn = document.createElement("BUTTON")
    const hcBtn = document.createElement("BUTTON")
    cBtn.innerHTML = "Download"
    uBtn.innerHTML = "Download"
    hcBtn.innerHTML = "Download"

    htmlElems.c.appendChild(cBtn)
    htmlElems.u.appendChild(uBtn)
    htmlElems.hc.appendChild(hcBtn)

    cBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: it.convertedStr})
    }
    uBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: it.unConvertedStr})
    }
    hcBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: it.originalStr})
    }
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
  //   - startingNum is still smaller than the # from the 1st hand
  function greaterThan(currentNum, startNum) {
    return (currentNum > startNum)
  }

  //   - currentNum is equal to the # from hand before (takes care of +50 glitch)
  function duplicateHand(currentNum, beforeNum) {
    return (currentNum === beforeNum)
  }

  // Checks If current hand num is less than endNum
  function isLastHand(endNum, currentNum) {
    return endNum > currentNum
  }

})(APP_SETTING, APP_METHODS, HELPER_METHODS)
