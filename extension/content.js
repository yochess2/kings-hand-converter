((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const s = APP_SETTING('store')
  const p = APP_METHODS.parser
  let delay = ms => new Promise(res => setTimeout(res, ms))
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.text === 'rightClicked') {
      handleClick(s.starting_hand_num, s.ending_hand_num)
      sendResponse('performing operation')
    }

    if (msg.text === 'ONC') {
      handleClick(null, null, true)
      sendResponse('working on ONC')
    }
  })

  // FUNCTION 1
  async function handleClick(startNum, endNum, isOnc) {
    const app = await initApp(startNum, endNum, isOnc)
    if (app.error.val) {
      return alert(app.error.text)
    }
    if (isOnc) {
      return await processOnc(
        app.archiveHandElems, 
        app.downloadWin
      )
    } else {
      return await processArchive(
        app.archiveHandElems,
        app.downloadWin,
        parseInt(app.store[startNum]),
        parseInt(app.store[endNum])
      )
    }
  }

  // FUNCTION 1.1
  async function initApp(startNum, endNum, isOnc) {
    const app = {
      error: {
        val: false
      },
      downloadWin: h.makeDisplay('downloads', '', 'width=350,height=350,resizeable,scrollbars')
    }
    if (isOnc) {
      app.archiveHandElems = document.getElementById('lstHandNo').children
    } else {
      app.store = await h.getStorage([startNum, endNum])
      app.archiveHandElems = h.getUnreadyElem(['.style_hh_workspace', '.lc_list'])[0].children
      if (!(h.inputConditions(app.store[startNum], app.store[endNum]))) {
        h.setError(app.error, true, "Something wrong with popup.js")
        return app
      }
    }
    if (!(app.archiveHandElems)) {
      h.setError(app.error, true, "Something wrong with the hands")
      return app
    }
    app.downloadWin.document.write(`<div>Total Hands: <span class="handcount">${app.archiveHandElems.length}</span</div>`)
    app.downloadWin.document.write(`<div>Convertable Hands: <span id="c">0</span></div>`)
    app.downloadWin.document.write(`<div>Unconvertable Hands: <span id="u">0</span></div>`)
    return app
  }

  // FUNCTION 1.2
  async function processArchive(archiveHandElems, downloadWin, startNum, endNum) {
    let counter = 0, hasResults = false
    let currentNum, beforeNum
    let convertedStr = ''
    let unConvertedStr = ''
    const c = downloadWin.document.getElementById('c')
    const u = downloadWin.document.getElementById('u')
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
      const convertedHand = convert(unconvertedHand)

      if (convertedHand.display === true) {
        convertedStr += convertedHand.text + '\n'
        c.innerHTML = parseInt(c.innerHTML) + 1
      } else {
        unConvertedStr += unconvertedHand.text + '\n'
        u.innerHTML = parseInt(u.innerHTML) + 1
      }
      counter++
    }

    const cBtn = document.createElement("BUTTON")
    const uBtn = document.createElement("BUTTON")
    cBtn.innerHTML = "Download"
    uBtn.innerHTML = "Download"
    c.appendChild(cBtn)
    u.appendChild(uBtn)

    cBtn.onclick = (stuff) => {
      let convertedBlob = new Blob([convertedStr], {type: "text/plain;charset=utf-8"})
      saveAs(convertedBlob, "converted.txt");
    }
    uBtn.onclick = (stuff) => {
      let unConvertedBlob = new Blob([unConvertedStr], {type: "text/plain;charset=utf-8"});
      saveAs(unConvertedBlob, "unconverted.txt");
    }
    return hasResults
  }

  async function processOnc(handsDropDown, downloadWin) {
    let counter = 0, hasResults = false
    let currentNum, beforeNum
    let convertedStr = ''
    let unConvertedStr = ''
    const c = downloadWin.document.getElementById('c')
    const u = downloadWin.document.getElementById('u')
    console.log(`fetching ${handsDropDown.length} hands`)
    for (const handDropDown of handsDropDown) {
      let link = "HH_Parser_CashierPages.asp?Details="+handDropDown.value.replace(' ', "%20")
      let unconvertedHand = await fetchHand(link)
      convertedHand = convertOnc(unconvertedHand)
      if (convertedHand.display) {
        convertedStr += convertedHand.text
        c.innerHTML = parseInt(c.innerHTML) + 1
      } else {
        unConvertedStr += unconvertedHand.text + '\n'
        u.innerHTML = parseInt(u.innerHTML) + 1
      }
      counter++
    }
    const cBtn = document.createElement("BUTTON")
    const uBtn = document.createElement("BUTTON")
    cBtn.innerHTML = "Download"
    uBtn.innerHTML = "Download"
    c.appendChild(cBtn)
    u.appendChild(uBtn)

    cBtn.onclick = (stuff) => {
      let convertedBlob = new Blob([convertedStr], {type: "text/plain;charset=utf-8"})
      console.log(convertedStr)
      saveAs(convertedBlob, "converted.txt");
    }
    uBtn.onclick = (stuff) => {
      let unConvertedBlob = new Blob([unConvertedStr], {type: "text/plain;charset=utf-8"})
      console.log(unConvertedStr)

      saveAs(unConvertedBlob, "unconverted.txt");
    }
  }

   //////////////////////////////
  /// Parser Methods for ONC ///
 //////////////////////////////
  async function fetchHand(link) {
    await delay(1)
    return fetch(link).then((response) => {
      return response.text()
    }).then((data) => {
      return getUnconvertedHand(data)
    })
  }

  function getUnconvertedHand(data) {
    let result = {
      text: '',
      lines: []
    }
    let lines = data.split(/\<\/span\>/)
    lines.forEach((line) => {
      let newLine = line
        .replace(/\<span class\=blackheader\>/ig, '')
        .replace(/\<br\>/ig, '')
        .replace(/\<img src=.*\>/ig, '')
      if (newLine !== '') {
        result.text += newLine + '\n'
        result.lines.push(newLine)
      }
    })
    return result
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

})(APP_SETTING, APP_METHODS, HELPER_METHODS)
