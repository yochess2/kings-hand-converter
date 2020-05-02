((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const a = APP_SETTING('archive')
  let delay = ms => new Promise(res => setTimeout(res, ms))

  APP_METHODS.processOnc = {
    processOnc: processOnc
  }

  async function processOnc(handsDropDown, downloadWin, htmlElems) {
    let convertedStr = ''
    let unConvertedStr = ''
    let originalStr = ''
    let isStop = false
    htmlElems.stop.onclick = () => {
      isStop = true
    }

    console.log(`fetching ${handsDropDown.length} hands`)
    for (const handDropDown of handsDropDown) {
      if (isStop) {
        break
      }
      let link = "HH_Parser_CashierPages.asp?Details="+handDropDown.value.replace(' ', "%20")
      let unconvertedHand = await fetchHand(link)
      let counter = 0
      while(!(unconvertedHand) && !(isStop)) {
        await delay(1000)
        htmlElems.stop.onclick = () => {
          isStop = true
        }
        unconvertedHand = await fetchHand(link)
        htmlElems.lag.innerHTML = `${parseInt(counter)}/${a.timeToDelay/100}`
        if (counter > a.timeToDelay/100) {
          htmlElems.lag.innerHTML = `DISCONNECTED!`
          break
        }
        counter++
      }
      if (!(unconvertedHand)) {
        break
      }
      originalStr += unconvertedHand.text + '\n'
      convertedHand = convertOnc(unconvertedHand)
      if (convertedHand.display) {
        convertedStr += convertedHand.text + '\n'
        htmlElems.c.innerHTML = parseInt(htmlElems.c.innerHTML) + 1
      } else {
        unConvertedStr += unconvertedHand.text + '\n'
        htmlElems.u.innerHTML = parseInt(htmlElems.u.innerHTML) + 1
      }
      htmlElems.l.innerHTML = handDropDown.value
    }

    createButtons(htmlElems, convertedStr, unConvertedStr, originalStr)
  }

    function createButtons(htmlElems, convertedStr, unConvertedStr, originalStr) {
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
      chrome.runtime.sendMessage({text: 'download', str: convertedStr})
    }
    uBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: unConvertedStr})
    }
    hcBtn.onclick = (stuff) => {
      chrome.runtime.sendMessage({text: 'download', str: originalStr})
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
    }).catch((error) => {
      return console.log('>>>>', error)
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
