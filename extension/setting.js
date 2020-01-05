function APP_SETTING(type) {
  if (type === 'popup') {
    return {
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
  }
}
