((APP_SETTING, APP_METHODS, HELPER_METHODS) => {
  const h = HELPER_METHODS()
  const s = APP_SETTING('store')
  const p_o = APP_METHODS.processOnc
  const p_k = APP_METHODS.processKings

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.text === 'rightClicked') {
      handleClick(s.starting_hand_num, s.ending_hand_num, s.auto_click_num)
      sendResponse('performing operation')
    }

    if (msg.text === 'ONC') {
      handleClick(null, null, null, true)
      sendResponse('working on ONC')
    }
  })

  async function handleClick(startNum, endNum, autoClick, isOnc) {
    const app = await initApp(startNum, endNum, autoClick, isOnc)
    if (app.error.val) {
      return alert(app.error.text)
    }
    if (isOnc) {
      return await p_o.processOnc(
        app.archiveHandElems, 
        app.downloadWin,
        app.htmlElems
      )
    } else {
      return await p_k.processArchive(
        app.archiveHandElems,
        app.downloadWin,
        app.htmlElems,
        parseInt(app.store[startNum]),
        parseInt(app.store[endNum]),
        app.store[autoClick]
      )
    }
  }

  async function initApp(startNum, endNum, autoClick, isOnc) {
    const app = {
      error: {
        val: false
      },
      downloadWin: h.makeDisplay('downloads', '', 'width=350,height=350,resizeable,scrollbars')
    }
    if (isOnc) {
      app.archiveHandElems = document.getElementById('lstHandNo').children
    } else {
      app.store = await h.getStorage([startNum, endNum, autoClick])
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

    app.htmlElems = handleHtml(app)
    return app
  }

  function handleHtml(app) {
    app.downloadWin.document.write(`<div>Total Hands: <span id="handcountElem">${app.archiveHandElems.length}</span></div>`)
    app.downloadWin.document.write(`<div>Convertable Hands: <span id="c">0</span></div>`)
    app.downloadWin.document.write(`<div>Unconvertable Hands: <span id="u">0</span></div>`)
    app.downloadWin.document.write(`<div>Duplicate Bug: <span id="d">0</span></div>`)
    app.downloadWin.document.write(`<div>Last Hand: <span id="l"></span></div>`)
    app.downloadWin.document.write(`<div>Lag (will auto-close at 100): <span id="lag"></span></div>`)
    app.downloadWin.document.write(`<div>Click to Stop: <button id="stop">STOP</button></div>`)

    return {
      hc: app.downloadWin.document.getElementById('handcountElem'),
      c: app.downloadWin.document.getElementById('c'),
      u: app.downloadWin.document.getElementById('u'),
      d: app.downloadWin.document.getElementById('d'),
      l: app.downloadWin.document.getElementById('l'),
      lag: app.downloadWin.document.getElementById('lag'),
      stop: app.downloadWin.document.getElementById('stop')
    }
  }
})(APP_SETTING, APP_METHODS, HELPER_METHODS)
