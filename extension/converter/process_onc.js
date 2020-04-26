((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  let delay = ms => new Promise(res => setTimeout(res, ms))

  APP_METHODS.processOnc = {
    processOnc: processOnc
  }

  async function processOnc(handsDropDown, downloadWin) {
    let counter = 0, hasResults = false
    let convertedStr = ''
    let unConvertedStr = ''
    let isStop = false
    const c = downloadWin.document.getElementById('c')
    const u = downloadWin.document.getElementById('u')
    const l = downloadWin.document.getElementById('l')
    const stop = downloadWin.document.getElementById('stop')
    stop.onclick = () => {
      isStop = true
    }

    console.log(`fetching ${handsDropDown.length} hands`)
    for (const handDropDown of handsDropDown) {
      if (isStop) {
        break
      }
      let link = "HH_Parser_CashierPages.asp?Details="+handDropDown.value.replace(' ', "%20")
      let unconvertedHand = await fetchHand(link)
      convertedHand = convertOnc(unconvertedHand)
      if (convertedHand.display) {
        convertedStr += convertedHand.text + '\n'
        c.innerHTML = parseInt(c.innerHTML) + 1
      } else {
        unConvertedStr += unconvertedHand.text + '\n'
        u.innerHTML = parseInt(u.innerHTML) + 1
      }
      l.innerHTML = handDropDown.value
      counter++
    }
    const cBtn = document.createElement("BUTTON")
    const uBtn = document.createElement("BUTTON")
    cBtn.innerHTML = "Download"
    uBtn.innerHTML = "Download"
    c.appendChild(cBtn)
    u.appendChild(uBtn)

    cBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: convertedStr})
      console.log(convertedStr)
      // let convertedBlob = new Blob([convertedStr], {type: "text/plain;charset=utf-8"})
      // saveAs(convertedBlob, "converted.txt")
    }
    uBtn.onclick = (stuff) => {
      console.log(unConvertedStr)
      chrome.runtime.sendMessage({text: 'download', str: unConvertedStr})
      // let unConvertedBlob = new Blob([unConvertedStr], {type: "text/plain;charset=utf-8"})
      // saveAs(unConvertedBlob, "unconverted.txt")

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
})(APP_SETTING, APP_METHODS, HELPER_METHODS)
