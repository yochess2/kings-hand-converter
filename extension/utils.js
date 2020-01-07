const APP_METHODS = {}
function HELPER_METHODS() {
  const createObject = (key, val) => { const obj = {}; obj[key] = val; return obj }
  const delay = ms => new Promise(res => setTimeout(res, ms))
  const isPositiveNum = num => num > 0
  const isGreaterThan = (a,b) => parseInt(a) > parseInt(b)
  const setStorageVal = (name, val) => chrome.storage.sync.set(createObject(name, val))
  const setElemText = (name, val) => $(name).text(val)
  const getElemVal = name => $(name).val()
  const setElemVal = (name, text) => $(name).val(text)
  const setError = (err, val, text) => { err.val = val; err.text = text }

  return {
    // general
    createObject: createObject,
    delay: delay,

    // math
    isPositiveNum: isPositiveNum,
    isGreaterThan: isGreaterThan,

    // storage
    getStorage: getStorage,
    setStorageVal: setStorageVal,

    // jquery
    setElemText: setElemText,
    getElemVal: getElemVal,
    setElemVal: setElemVal,
    getUnreadyElem: getUnreadyElem,

    // for new displays
    makeDisplay: makeDisplay,
    hookAlert: hookAlert,

    // error handling
    setError: setError,

    // for this app
    inputConditions: inputConditions,
  }

  function getStorage(strOrArray) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(strOrArray, storage => {
        resolve(storage)
      })
    })
  }

  function inputConditions(startNum, endNum) {
    if (isNaN(startNum) || isNaN(endNum)) {
      alert('Entries must be numbers')
      return false
    }
    if (!(isPositiveNum(startNum)) || !(isPositiveNum(endNum))) {
      alert('Entries must be positive numbers')
      return false
    }
    if (isGreaterThan(endNum, startNum)) {
      alert('Starting Number must be equal to or greater than Ending Number')
      return false
    }
    return true
  }

  function getUnreadyElem(arr) {
    const elem = $(arr.join(' '))
    if (!(elem) || !(elem)[0]) {
      return [[]]
    }
    return elem
  }

  // Need a better function, got this off the internet
  function hookAlert(display) {
    display = display || window
    display.onbeforeunload = function (e) {
      e = e || window.event
        return 'Sure?'
    }
  }

  function makeDisplay(url, title, specs) {
    const display = window.open(url, title, specs)
    display.document.write('...')
    return display
  }
}
