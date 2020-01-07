//hand comes in lines and text
function convertHand(old_hand) {
  const re = {
    line_1: /^#(\d+): (.*(?= - )) - (\d*\.?\d+)\/(\d*\.?\d+|pt)$/,
    line_2: /^(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)$/,
    line_3: /^Table '(.*(?='))'( Seat (\d) is the button)?$/,
    seat_line: /^Seat (\d): (\w+) \((\d*\.?\d+)\)( \((\d*\.?\d+) pts\))?$/,
    blind_line: /^(\w+): posts the (small|big) blind (\d*\.?\d+)$/,
    hand_line: /^Dealt to (\w+): \[(\w+) (\w+)( (\w+) (\w+))?\]$/,
    action_line: /^(\w+) (folds|checks|calls|bets|raises to)( (\d*\.?\d+))?(\, and is (all in))?$/,
    flop_line: /^\*\*\* FLOP \*\*\* \[(\w+) (\w+) (\w+)\]$/,
    turn_line: /^\*\*\* TURN \*\*\* \[\w+ \w+ \w+\] \[(\w+)\]$/,
    river_line: /^\*\*\* RIVER \*\*\* \[\w+ \w+ \w+ \w+\] \[(\w+)\]$/,
    show_line: /^(\w+) shows (\[\w+ \w+( \w+ \w+)?\])$/,
    winner_line_1: /^(\w+) wins pot \((\d*\.?\d+)\)$/,
    winner_line_2: /^(\w+) wins \((\d*\.?\d+)\) from pot$/,
    rake_line: /^Rake (\d*\.?\d+)$/
  }
  const hand_details = {}
  const newHand = {
    display: false,
    text: ''
  }
  populateHandDetails(hand_details, re, old_hand)
  if (!(isGameCoverage(hand_details))) {
    return newHand
  }
  newHand.display = true
  turnToStars(hand_details, re, old_hand, newHand)
  return newHand
}

function getButtonLine(num) {
  if (num) {
    return ` Seat #${num} is the button`
  } else {
    return ''
  }
}

function isGameCoverage(hd) {
  let isConvert = false
  if (hd.type === 'Limit Holdem') {
    hd.type = "Hold'em Limit"
    isConvert = true
  }
  if (hd.type === 'Limit Omaha Hi-Lo') {
    hd.type = "Omaha Hi/Lo Limit"
    isConvert = true
  }
  return isConvert
}

// hand_details
// hand_number: 18454332,
// type: "Limit Holdem",
// stake: ["1.50", "3"]
// date: ["year", "month", "day"]
// time: ["hour", "minute", "second"]
// table: "Learn HORSE"
// button: "1"
function populateHandDetails(hand_details, re, old_hand) {
  const details_1 = old_hand.lines[0].match(re.line_1)
  const details_2 = old_hand.lines[1].match(re.line_2)
  const details_3 = old_hand.lines[2].match(re.line_3)

  hand_details.hand_number = details_1[1],
  hand_details.type = details_1[2],
  hand_details.stake = [details_1[3], details_1[4]]
  hand_details.date = [details_2[1], details_2[2], details_2[3]]
  hand_details.time = [(parseInt(details_2[4])-5)+'', details_2[5], details_2[6]]
  hand_details.table = details_3[1]
  hand_details.button_num = details_3[3]
}

function turnToStars(hd, re, old_hand, newHand) {
  // top 2 lines
  const line_1 = `PokerStars Hand ${hd.hand_number}:  ${hd.type} (${hd.stake[0]}/${hd.stake[1]}) - ${hd.date[0]}/${hd.date[1]}/${hd.date[2]} ${hd.time[0]}:${hd.time[1]}:${hd.time[2]} ET`
  const line_2 = `Table '${hd.table}'${getButtonLine(hd.button_num)}`
  newHand.text += line_1 + '\n' + line_2 + '\n'

  if (hd.type === "Hold'em Limit" || hd.type === "Omaha Hi/Lo Limit") {
    toLheAndPopulate(hd, re, old_hand, newHand)
  }
}

function toLheAction(i, re, old_hand, bb_amount) {
  let result = ''
  let action_line
  let last_bet = parseFloat(bb_amount)
  for (i; i < old_hand.lines.length; i++) {
    action_line = old_hand.lines[i].match(re.action_line)
    if (action_line) {
      result += `${action_line[1]}:`
      // check if action is a raise or other condition
      if (action_line[2] === 'raises to') {
        result += ` raises $${last_bet} to $${action_line[4]}`
        last_bet = parseFloat(action_line[4])
      } else {
        result += ` ${action_line[2]}`
        if (action_line[3]) {
          result += ` $${action_line[4]}`
        }
      }
      // set bb_amount if there's a bet after preflop
      if (action_line[2] === 'bets') {
        last_bet = action_line[4]
      }
      // check if there's all in
      if (action_line[5]) {
        result += ' and is all-in'
      }
      result += '\n'
    } else {
      break
    }
  }
  return [i, result]
}

// hd.players = [
//   ["seat #", "player name", "chips"],
//   ["seat #", "player name", "chips"],
//   ["seat #", "player name", "chips"]
// ]
// hd.blinds = [
//   ["player name", "blind type", "amount"],
//   ["player name", "blind type", "amount"]
// ]
function toLheAndPopulate(hd, re, old_hand, newHand) {
  let seat_line, blind_line, hand_line, show_line, i

  // seat lines
  for (i = 3; i < old_hand.lines.length; i++) {
    hd.players = []
    seat_line = old_hand.lines[i].match(re.seat_line)
    if (seat_line) {
      hd.players.push([seat_line[1], seat_line[2], seat_line[3]])
      newHand.text += `Seat ${seat_line[1]}: ${seat_line[2]} ($${seat_line[3]} in chips)\n`
    } else {
      break
    }
  }

  // blind lines
  for (i; i < old_hand.lines.length; i++) {
    blind_line = old_hand.lines[i].match(re.blind_line)
    if (blind_line) {
      blind_line[2] === "small" ? hd.sb = [blind_line[1], blind_line[2], blind_line[3]] : hd.bb = [blind_line[1], blind_line[2], blind_line[3]]
      newHand.text += `${blind_line[1]}: posts ${blind_line[2]} blind $${blind_line[3]}\n`
    } else {
      break
    }
  }

  newHand.text += '*** HOLE CARDS ***\n'
  i+=1

  // dealt hand lines
  for (i; i < old_hand.lines.length; i++) {
    if (hd.type === "Hold'em Limit" || hd.type === "Omaha Hi/Lo Limit") {
      hand_line = old_hand.lines[i].match(re.hand_line)
    }
    if (hand_line) {
      if (hand_line[2] === 'X') {
        continue
      }
      if (hd.type === "Hold'em Limit") {
        newHand.text += `Dealt to ${hand_line[1]} [${hand_line[2]} ${hand_line[3]}]\n`
      } else if (hd.type === "Omaha Hi/Lo Limit") {
        newHand.text += `Dealt to ${hand_line[1]} [${hand_line[2]} ${hand_line[3]} ${hand_line[5]} ${hand_line[6]}]\n`
      }
    } else {
      break
    }
  }

  // preflop
  let actionArr = toLheAction(i, re, old_hand, hd.bb[2])
  i = actionArr[0]
  newHand.text += actionArr[1]

  // flop
  let flop_line = old_hand.lines[i].match(re.flop_line)
  if (flop_line) {
    newHand.text += flop_line[0] + '\n'
    i+=1
  }
  actionArr = toLheAction(i, re, old_hand, null)
  i = actionArr[0]
  newHand.text += actionArr[1]

  // turn
  let turn_line = old_hand.lines[i].match(re.turn_line)
  if (turn_line) {
    newHand.text += turn_line[0] + '\n'
    i+=1
  }
  actionArr = toLheAction(i, re, old_hand, null)
  i = actionArr[0]
  newHand.text += actionArr[1]

  // river
  let river_line = old_hand.lines[i].match(re.river_line)
  if (river_line) {
    newHand.text += river_line[0] + '\n'
    i+=1
  }
  actionArr = toLheAction(i, re, old_hand, null)
  i = actionArr[0]
  newHand.text += actionArr[1]

  // showdown line
  let showdown_declared = false
  for (i; i < old_hand.lines.length; i++) {
    show_line = old_hand.lines[i].match(re.show_line)
    if (show_line) {
      if (!(showdown_declared)) {
        newHand.text += '*** SHOW DOWN ***\n'
        showdown_declared = true
      }
      newHand.text += `${show_line[1]}: shows ${show_line[2]}\n`
    } else {
      break
    }
  }

  // for rake
  let pot_total = 0
  let rake = 0
  let rake_line = old_hand.lines[(old_hand.lines.length -1)].match(re.rake_line)
  if (rake_line) {
    rake = parseFloat(rake_line[1])
    pot_total += rake
  }

  // winner line
  let winner_line_1 = old_hand.lines[i].match(re.winner_line_1)
  let winner_line_2 = old_hand.lines[i].match(re.winner_line_2)
  for (i; i < old_hand.lines.length; i++) {
    winner_line = old_hand.lines[i].match(re.winner_line_1) || old_hand.lines[i].match(re.winner_line_2)
    if (winner_line) {
      newHand.text += `${winner_line[1]} collected $${winner_line[2]} from pot\n`
      pot_total += parseFloat(winner_line[2])
    } else {
      break
    }
  }
  newHand.text += "*** SUMMARY ***\n"
  newHand.text += `Total pot $${pot_total} | Rake $${rake}\n`
}
