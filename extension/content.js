((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const s = APP_SETTING('store')
  const p_o = APP_METHODS.processOnc
  const p_k = APP_METHODS.processKings

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

  async function handleClick(startNum, endNum, isOnc) {
    const app = await initApp(startNum, endNum, isOnc)
    if (app.error.val) {
      return alert(app.error.text)
    }
    if (isOnc) {
      return await p_o.processOnc(
        app.archiveHandElems, 
        app.downloadWin
      )
    } else {
      return await p_k.processArchive(
        app.archiveHandElems,
        app.downloadWin,
        parseInt(app.store[startNum]),
        parseInt(app.store[endNum])
      )
    }
  }

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
    app.downloadWin.document.write(`<div>Last Converted Hand: <span id="l"></span></div>`)
    return app
  }
})(APP_SETTING, APP_METHODS, HELPER_METHODS)
