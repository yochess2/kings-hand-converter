((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const p = APP_METHODS.parserKings
  const a = APP_SETTING('archive')

  APP_METHODS.processKings = {
  	processArchive: processArchive
  }

  async function processArchive(archiveHandElems, downloadWin, startNum, endNum, autoClick) {
    let hasResults = false
    const c = downloadWin.document.getElementById('c')
    const u = downloadWin.document.getElementById('u')
    const l = downloadWin.document.getElementById('l')
    const d = downloadWin.document.getElementById('d')
    const lag = downloadWin.document.getElementById('lag')
    let it = {
      counter: 0,
      startNum: startNum,
      endNum: endNum,
      convertedStr: '',
      unConvertedStr: ''
    }
    await loopIt(archiveHandElems, it, c, u, l, d, lag)

    const elem_fiddy = document.getElementsByClassName('style_button style_banner_button')[0]
    let elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
    let hand_count = elem_hand_count.innerHTML
    let start_hand = 0
    let end_hand = 49
    if ((autoClick === 'yes') && (!(it.error))) {
      start_hand += 50
      end_hand += 50
      // console.log('auto click feature not yet available')
      while (!(isLastHand(it.endNum, it.currentNum))) {
        let inner_counter = 0
        hand_count = elem_hand_count.innerHTML // 50
        elem_fiddy.click()
        while ((hand_count === elem_hand_count.innerHTML) && (inner_counter < 1000)) {
          elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
          lag.innerHTML = `${parseInt(inner_counter/100)}/${a.timeToDelay/100}`
          await h.delay(1)
          inner_counter++
        }
        if (inner_counter <= a.timeToDelay) {
          await loopIt(archiveHandElems, it, c, u, l, d, lag)
        }
      }
    }

    const cBtn = document.createElement("BUTTON")
    const uBtn = document.createElement("BUTTON")
    cBtn.innerHTML = "Download"
    uBtn.innerHTML = "Download"
    c.appendChild(cBtn)
    u.appendChild(uBtn)

    cBtn.onclick = (stuff) => {
      let convertedBlob = new Blob([it.convertedStr], {type: "text/plain;charset=utf-8"})
      console.log(it.convertedStr)
      saveAs(convertedBlob, "converted.txt");
    }
    uBtn.onclick = (stuff) => {
      let unConvertedBlob = new Blob([it.unConvertedStr], {type: "text/plain;charset=utf-8"});
      console.log(it.unConvertedStr)
      saveAs(unConvertedBlob, "unconverted.txt");
    }
    return hasResults
  }

  async function loopIt(archiveHandElems, it, c, u, l, d, lag) {
    for (const archiveHandElem of archiveHandElems) {
      if (!(validHand(archiveHandElem))) {
        continue
      }
      it.currentNum = getCurrentArchiveHandNum(archiveHandElem)
      if (it.newBatchNum) {
       if (it.currentNum >= it.newBatchNum) {
        continue
       } 
      }

      if (skipHand(it.currentNum, it.startNum)) {
        continue
      }
      if (duplicateHand(it.currentNum, it.beforeNum, it.startNum)) {
        d.innerHTML = parseInt(d.innerHTML) + 1
        continue
      }
      if (isLastHand(it.endNum, it.currentNum)) {
        break
      }
      it.beforeNum = it.currentNum
      const unconvertedHand = await p.fetchUnconvertedHand(archiveHandElem, lag)
      if (unconvertedHand.error) {
        it.error = true
        break
      }
      const convertedHand = convert(unconvertedHand)
      if (convertedHand.display === true) {
        it.convertedStr += convertedHand.text + '\n'
        c.innerHTML = parseInt(c.innerHTML) + 1
      } else {
        it.unConvertedStr += unconvertedHand.text + '\n'
        u.innerHTML = parseInt(u.innerHTML) + 1
      }
      l.innerHTML = it.currentNum
      it.newBatchNum = it.currentNum
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
  function skipHand(currentNum, startNum) {
    return (startNum < currentNum)
  }

  //   - currentNum is equal to the # from hand before (takes care of +50 glitch)
  function duplicateHand(currentNum, beforeNum, startNum) {
    return (currentNum === beforeNum)
  }

  // Checks If current hand num is less than endNum
  function isLastHand(endNum, currentNum) {
    return endNum > currentNum
  }

})(APP_SETTING, APP_METHODS, HELPER_METHODS)
