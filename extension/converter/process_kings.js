((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const p = APP_METHODS.parserKings

  APP_METHODS.processKings = {
  	processArchive: processArchive
  }

  async function processArchive(archiveHandElems, downloadWin, startNum, endNum, autoClick) {
    let hasResults = false
    const c = downloadWin.document.getElementById('c')
    const u = downloadWin.document.getElementById('u')
    const l = downloadWin.document.getElementById('l')
    const d = downloadWin.document.getElementById('d')
    let it = {
      counter: 0,
      startNum: startNum,
      endNum: endNum,
      convertedStr: '',
      unConvertedStr: ''
    }
    const elem_fiddy = document.getElementsByClassName('style_button style_banner_button')[0]
    let elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
    let hand_count = elem_hand_count.innerHTML

    await loopIt(archiveHandElems, it, c, u, l, d)
    if ((autoClick === 'yes') && (!(it.error))) {
      console.log('auto click feature not yet available')
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

  async function loopIt(archiveHandElems, it, c, u, l, d) {
    for (const archiveHandElem of archiveHandElems) {
      if (!(validHand(archiveHandElem))) {
        continue
      }
      it.currentNum = getCurrentArchiveHandNum(archiveHandElem)
      if (skipHand(it.currentNum, it.beforeNum, it.startNum)) {
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
      const unconvertedHand = await p.fetchUnconvertedHand(archiveHandElem)
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
      it.counter++
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
  //   - currentNum is equal to the # from hand before (takes care of +50 glitch)
  //   - startingNum is still smaller than the # from the 1st hand
  function skipHand(currentNum, beforeNum, startNum) {
    return (startNum < currentNum)
  }

  function duplicateHand(currentNum, beforeNum, startNum) {
    return (currentNum === beforeNum)
  }

  // Checks If current hand num is less than endNum
  function isLastHand(endNum, currentNum) {
    return endNum > currentNum
  }

})(APP_SETTING, APP_METHODS, HELPER_METHODS)
