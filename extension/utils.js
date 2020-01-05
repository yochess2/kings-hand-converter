function HELPER_METHODS() {
  return {
    // general
    createObject: createObject,

    // math
    isPositiveNum: num => num > 0,
    isGreaterThan: (a,b) => parseInt(a) > parseInt(b),

    // storage
    getStorage: getStorage,
    setStorageVal: (name, val) => chrome.storage.sync.set(createObject(name, val)),

    // jquery
    setElemText: (name, val) => $(name).text(val),
    getElemVal: name => $(name).val(),
    setElemVal: (name, text) => $(name).val(text),
  }

  function createObject(key, val) {
    const obj = {};
    obj[key] = val;
    return obj
  }

  function getStorage(strOrArray) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(strOrArray, storage => {
        resolve(storage)
      })
    })
  }
}
