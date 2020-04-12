function APP_SETTING(type) {
  if (type === 'store') {
    return {
      starting_hand_num: 'starting-hand-num',
      ending_hand_num: 'ending-hand-num'
    }
  }

  if (type === 'popup') {
    return {
      starting_input_id: '#starting-input',
      ending_input_id: '#ending-input',
      starting_hand_num_id: '#starting-hand',
      ending_hand_num_id: '#ending-hand',
      submit_button_id: '#submit-button'
    }
  }

  if (type === 'archive') {
    let obj = {
      timeToDelay: 10000,
      clickEvent: document.createEvent('MouseEvents'),
      doubleClickEvent: document.createEvent('MouseEvents'),
    }
    obj.clickEvent.initEvent('mousedown', true, true)
    obj.doubleClickEvent.initEvent('dblclick', true, true)
    return obj
  }
}
