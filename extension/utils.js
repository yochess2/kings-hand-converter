function HELPER_METHODS() {
  const createObject = (key, val) => { const obj = {}; obj[key] = val; return obj }
  const delay = ms => new Promise(res => setTimeout(res, ms))
  const isPositiveNum = num => num > 0
  const isGreaterThan = (a,b) => parseInt(a) > parseInt(b)
  const setStorageVal = (name, val) => chrome.storage.sync.set(createObject(name, val))
  const setElemText = (name, val) => $(name).text(val)
  const getElemVal = name => $(name).val()
  const setElemVal = (name, text) => $(name).val(text)

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
}
