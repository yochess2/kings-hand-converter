((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const p = APP_METHODS.parserKings

  APP_METHODS.processKings = {
  	processArchive: processArchive
  }

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
      console.log(convertedStr)
      saveAs(convertedBlob, "converted.txt");
    }
    uBtn.onclick = (stuff) => {
      let unConvertedBlob = new Blob([unConvertedStr], {type: "text/plain;charset=utf-8"});
      console.log(unConvertedStr)
      saveAs(unConvertedBlob, "unconverted.txt");
    }
    return hasResults
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
