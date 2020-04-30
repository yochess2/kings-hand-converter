((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const p = APP_METHODS.parserKings
  const a = APP_SETTING('archive')

  APP_METHODS.processKings = {
  	processArchive: processArchive
  }

  async function processArchive(archiveHandElems, downloadWin, startNum, endNum, autoClick) {
    let hasResults = false
    const hc = downloadWin.document.getElementById('handcount')
    const c = downloadWin.document.getElementById('c')
    const u = downloadWin.document.getElementById('u')
    const d = downloadWin.document.getElementById('d')
    const l = downloadWin.document.getElementById('l')
    const lag = downloadWin.document.getElementById('lag')
    const stop = downloadWin.document.getElementById('stop')

    let it = {
      counter: 0,
      startNum: startNum,
      endNum: endNum,
      originalStr: '',
      convertedStr: '',
      unConvertedStr: '',
      isStop: false
    }
    stop.onclick = () => {
      it.isStop = true
    }

    await loopIt(archiveHandElems, it, c, u, l, d, hc, lag)

    const elem_fiddy = document.getElementsByClassName('style_button style_banner_button')[0]
    let elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
    let hand_count = elem_hand_count.innerHTML
    let outer_counter = 0
    if ((autoClick === 'yes') && (!(it.error)) && (outer_counter < 1000)) {
      while (!(isLastHand(it.endNum, it.currentNum)) && !(it.isStop)) {
        let inner_counter = 0
        hand_count = elem_hand_count.innerHTML // 50
        elem_fiddy.click()
        while ((hand_count === elem_hand_count.innerHTML) && (inner_counter < a.timeToDelay) && (!(it.isStop))) {
          elem_hand_count = document.getElementsByClassName('style_status_bar_pane')[1]
          lag.innerHTML = `${parseInt(inner_counter/100)}/${a.timeToDelay/100}`
          await h.delay(1)
          inner_counter++
        }
        if (inner_counter <= a.timeToDelay + 1) {
          hc.innerHTML = archiveHandElems.length
          await h.delay(1)
          it.looped = false
          await loopIt(archiveHandElems, it, c, u, l, d, hc, lag)
          if (!(it.looped)) {
            h.delay(2000)
          }
        } else {
          lag.innerHTML = `TIME OUT`
          break
        }
        outer_counter++
      }
    }

    const cBtn = document.createElement("BUTTON")
    const uBtn = document.createElement("BUTTON")
    const hcBtn = document.createElement("BUTTON")
    cBtn.innerHTML = "Download"
    uBtn.innerHTML = "Download"
    hcBtn.innerHTML = "Download"
    c.appendChild(cBtn)
    u.appendChild(uBtn)
    hc.appendChild(hcBtn)

    cBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: it.convertedStr})
    }
    uBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: it.unConvertedStr})
    }
    hcBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: it.originalStr})
    }
    return hasResults
  }

  async function loopIt(archiveHandElems, it, c, u, l, d, hc, lag) {
    for (const archiveHandElem of archiveHandElems) {
      if (it.isStop) { break }
      if (!(validHand(archiveHandElem))) { continue }
      it.currentNum = getCurrentArchiveHandNum(archiveHandElem)

      // if looped, skip to next batch
      if (it.lastNum && it.currentNum >= it.lastNum) {
        continue 
      } 

      // if currentnum equals to previous num, skip
      if (duplicateHand(it.currentNum, it.beforeNum)) {
        console.log(it.currentNum, it.beforeNum)
        d.innerHTML = parseInt(d.innerHTML) + 1
        continue
      }

      // if currentnum is greater than startnum, skip
      if (greaterThan(it.currentNum, it.startNum)) {
        it.beforeNum = it.currentNum
        continue
      }
      if (isLastHand(it.endNum, it.currentNum)) {
        break
      }
      const unconvertedHand = await p.fetchUnconvertedHand(archiveHandElem, lag)
      if (unconvertedHand.error) {
        it.error = true
        break
      }
      it.originalStr += unconvertedHand.text + '\n'
      const convertedHand = convert(unconvertedHand)
      if (convertedHand.display === true) {
        it.convertedStr += convertedHand.text + '\n'
        c.innerHTML = parseInt(c.innerHTML) + 1
      } else {
        it.unConvertedStr += unconvertedHand.text + '\n'
        u.innerHTML = parseInt(u.innerHTML) + 1
      }
      l.innerHTML = it.currentNum
      it.beforeNum = it.currentNum
      it.looped = true
    }
    it.lastNum = it.currentNum
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
