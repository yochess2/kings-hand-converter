$(() => {
  // Names of html elements and storage items
  const n = {
    popup: {
      starting_input_id: '#starting-input',
      ending_input_id: '#ending-input',
      starting_hand_num_id: '#starting-hand',
      ending_hand_num_id: '#ending-hand',
      submit_button_id: '#submit-button'
    },
    store: {
      starting_hand_num: 'starting-hand-num',
      ending_hand_num: 'ending-hand-num'
    }
  }

  // Helper functions
  const isPositiveNum = num => (!(isNaN(num))) && (num > 0)
  const setElemText = (elem, val) => $(elem).text(val)
  const setStorageVal = (name, val) => chrome.storage.sync.set(createObject(name, val))
  const getElemVal = elem => $(elem).val()
  const setElemVal = (elem, text) => $(elem).val(text)
  const createObject = (key, val) => { const obj = {}; obj[key] = val; return obj }

  // Displaying both the starting and ending hand value after user clicks on the popup icon
  displayHandNumFromStorage(n.popup['starting_hand_num_id'], n.popup['starting_input_id'], n.store['starting_hand_num'])
  displayHandNumFromStorage(n.popup['ending_hand_num_id'], n.popup['ending_input_id'], n.store['ending_hand_num'])

  // Setting both the starting and ending hand values after user clicks set
  $(n.popup.submit_button_id).click((val) => {
    setHandNum(getElemVal(n.popup['starting_input_id']), n.popup['starting_hand_num_id'], n.store['starting_hand_num'])
    setHandNum(getElemVal(n.popup['ending_input_id']), n.popup['ending_hand_num_id'], n.store['ending_hand_num'])
  })

  // Displays the stored hand numbers after user clicks on the popup icon
  function displayHandNumFromStorage(handElemId, inputElemId, name) {
    chrome.storage.sync.get(name, (store) => {
      setElemText(handElemId, store[name])
      if (isPositiveNum(store[name])) {
        setElemVal(inputElemId, store[name])
      }
    })
  }

  // Sets storage values and display values
  function setHandNum(num, elemId, storeName) {
    if (!(isPositiveNum(num))) {
      return alert('Entry is invalid!')
    }
    setElemText(elemId, num)
    setStorageVal(storeName, num)
  }
})


