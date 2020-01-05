((s,h) => {
  $(() => {
    // Displaying both the starting and ending hand value after user clicks on the popup icon
    displayHandNums(
      s.store['starting_hand_num'],
      s.store['ending_hand_num']
    )

    // Setting both the starting and ending hand values after user clicks set
    $(s.popup.submit_button_id).click((val) => {
      handleClick(
        h.getElemVal(s.popup['starting_input_id']),
        h.getElemVal(s.popup['ending_input_id'])
      )
    })

    // Displays the stored hand numbers after user clicks on the popup icon
    async function displayHandNums(startName, endName) {
      const store = await h.getStorage([startName, endName])
      h.setElemText(
        s.popup['starting_hand_num_id'],
        store[startName]
      )
      h.setElemVal(
        s.popup['starting_input_id'],
        store[startName]
      )
      h.setElemText(
        s.popup['ending_hand_num_id'],
        store[endName]
      )
      h.setElemVal(
        s.popup['ending_input_id'],
        store[endName]
      )
    }

    // Handling the click by saving the values
    function handleClick(startNum, endNum) {
      console.log(startNum)

      if (!(inputConditions(startNum, endNum))) {
        return
      }
      saveHandNums(
        startNum,
        s.popup['starting_hand_num_id'],
        s.store['starting_hand_num']
      )
      saveHandNums(
        endNum,
        s.popup['ending_hand_num_id'],
        s.store['ending_hand_num']
      )
    }

    // Input conditions
    function inputConditions(startNum, endNum) {
      if (isNaN(startNum) || isNaN(endNum)) {
        alert('Entries must be numbers')
        return false
      }
      if (!(h.isPositiveNum(startNum)) || !(h.isPositiveNum(endNum))) {
        alert('Entries must be positive numbers')
        return false
      }
      if (h.isGreaterThan(endNum, startNum)) {
        alert('Starting Number must be equal to or greater than Ending Number')
        return false
      }
      return true
    }

    // Sets storage values and display values
    function saveHandNums(num, elemId, storeName) {
      h.setElemText(elemId, num)
      h.setStorageVal(storeName, num)
    }
  })
})(APP_SETTING('popup'), HELPER_METHODS())
