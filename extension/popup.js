((APP_SETTING, HELPER_METHODS) => {
  $(() => {
    const s = APP_SETTING('store')
    const p = APP_SETTING('popup')
    const h = HELPER_METHODS()

    // Displaying both the starting and ending hand value after user clicks on the popup icon
    displayHandNums(
      s['starting_hand_num'],
      s['ending_hand_num'],
      s['auto_click_num']
    )

    // Setting both the starting and ending hand values after user clicks set
    $(p.submit_button_id).click((val) => {
      handleClick(
        h.getElemVal(p['starting_input_id']),
        h.getElemVal(p['ending_input_id']),
        h.getElemVal(p['auto_click_num_id'])
      )
    })

    // Displays the stored hand numbers after user clicks on the popup icon
    async function displayHandNums(startName, endName, autoClick) {
      const store = await h.getStorage([startName, endName, autoClick])
      h.setElemText(
        p['starting_hand_num_id'],
        store[startName]
      )
      h.setElemVal(
        p['starting_input_id'],
        store[startName]
      )
      h.setElemText(
        p['ending_hand_num_id'],
        store[endName]
      )
      h.setElemVal(
        p['ending_input_id'],
        store[endName]
      )
      h.setElemVal(
        p['auto_click_num_id'],
        store[autoClick]
      )
    }

    // Handling the click by saving the values
    function handleClick(startNum, endNum, autoClick) {
      if (!(h.inputConditions(startNum, endNum))) {
        return
      }
      saveHandNums(
        startNum,
        p['starting_hand_num_id'],
        s['starting_hand_num']
      )
      saveHandNums(
        endNum,
        p['ending_hand_num_id'],
        s['ending_hand_num']
      )
      h.setStorageVal(s['auto_click_num'], autoClick)
    }

    // Sets storage values and display values
    function saveHandNums(num, elemId, storeName) {
      h.setElemText(elemId, num)
      h.setStorageVal(storeName, num)
    }
  })
})(APP_SETTING, HELPER_METHODS)
