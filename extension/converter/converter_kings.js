//hand comes in lines and text

// for development mode purposes
// module.exports = {
//   convert: convert
// }


function convert(old_hand) {
  return convertHand(old_hand)
  function convertHand(old_hand) {
    const re = {
      line_1: /^#(\d+): (.*(?= - )) - (\d*\.?\d+)\/(\d*\.?\d+|pt)$/,
      line_2: /^(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)$/,
      line_3: /^Table '(.*(?='))'( Seat (\d) is the button)?$/,

      seat_line: /^Seat (\d): ((.*){1,1}) \((\d*\.?\,?\d*\.?\d+)\)( \((\d*\.?\,?\d*\.?\d+) pts\))?$/,
      blind_line: /^((.*){1,1}): posts the (small|big) blind (\d*\.?\,?\d*\.?\d+)(\, and is (all in))?$/,
      hand_line: /^Dealt to ((.*){1,1}): \[(\w+) (\w+)( (\w+) (\w+))?( (\w+))?\]$/,
      action_line: /^((.*){1,1}) (folds|checks|calls|bets|raises to)( (\d*\.?\,?\d*\.?\d+))?(\, and is (all in))?$/,

      flop_line: /^\*\*\* FLOP \*\*\* \[(\w+) (\w+) (\w+)\]$/,
      turn_line: /^\*\*\* TURN \*\*\* \[\w+ \w+ \w+\] \[(\w+)\]$/,
      river_line: /^\*\*\* RIVER \*\*\* \[\w+ \w+ \w+ \w+\] \[(\w+)\]$/,
      show_line: /^((.*){1,1}) shows (\[\w+ \w+( \w+ \w+)?( \w+)?\])$/,

      draw_action_line_1: /^((.*){1,1}) (stands pat|draws)( (\d))?$/,
      draw_action_line_2: /^((.*){1,1}) discards (\[(\w+)\s*(\w*)\s*(\w*)\s*(\w*)\s*(\w*)\s*\]) draws \[(\w+)\s*(\w*)\s*(\w*)\s*(\w*)\s*(\w*)\s*\]$/,
      draw_line: /^\*\*\* (\w+ DRAW) \*\*\*$/,

      winner_line_1: /^((.*){1,1}) wins pot \((\d*\.?\,?\d*\.?\d+)\)$/,
      winner_line_2: /^((.*){1,1}) wins \((\d*\.?\,?\d*\.?\d+)\) from pot$/,
      rake_line: /^Rake (\d*\.?\,?\d*\.?\d+)$/
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

  function populateHandDetails(hand_details, re, old_hand) {
    // hand_number: 18454332,
    // type: "Limit Holdem",
    // stake: ["1.50", "3"]
    // date: ["year", "month", "day"]
    // time: ["hour", "minute", "second"]
    // table: "Learn HORSE"
    // button: "1"
    const details_1 = old_hand.lines[0].match(re.line_1)
    const details_2 = old_hand.lines[1].match(re.line_2)
    const details_3 = old_hand.lines[2].match(re.line_3)
    hand_details.hand_number = details_1[1]
    hand_details.type = details_1[2]
    hand_details.stake = [details_1[3], details_1[4]]
    hand_details.date = [details_2[1], details_2[2], details_2[3]]
    hand_details.time = [(parseInt(details_2[4])-5)+'', details_2[5], details_2[6]]
    hand_details.table = details_3[1]
    hand_details.button_num = details_3[3]
  }

  function isGameCoverage(hd) {
    let isConvert = false
    if (hd.type === 'Limit Holdem') {
      hd.type = "Hold'em Limit"
      isConvert = true
    }
    if (hd.type === 'Limit Omaha Hi-Lo') {
      hd.type = 'Omaha Hi/Lo Limit'
      isConvert = true
    }
    if (hd.type === 'Limit 2-7 Triple Draw') {
      hd.type = 'Triple Draw 2-7 Lowball Limit'
      isConvert = true
    }
    if (hd.type === 'No Limit Holdem') {
      isConvert = true
      hd.type = "Hold'em No Limit"
    }
    if (hd.type === 'Pot Limit Omaha') {
      isConvert = true
      hd.type = "Omaha Pot Limit"
    }
    return isConvert
  }

  // POKERSTARS CONVERSION
  function turnToStars(hd, re, old_hand, newHand) {
    const getButtonLine = (num) => num ? ` Seat #${num} is the button` : ''
    const line_1 = `PokerStars Hand #${hd.hand_number}:  ${hd.type} ($${hd.stake[0]}/$${hd.stake[1]} USD) - ${hd.date[0]}/${hd.date[1]}/${hd.date[2]} ${hd.time[0]}:${hd.time[1]}:${hd.time[2]} ET`
    const line_2 = `Table '${hd.table}'${getButtonLine(hd.button_num)}`
    newHand.text += line_1 + '\n' + line_2 + '\n'
    if (hd.type === "Hold'em Limit"
      || hd.type === "Omaha Hi/Lo Limit"
      || hd.type === "Hold'em No Limit"
      || hd.type === "Omaha Pot Limit"
      ) {
      toHoldemOmahaAndPopulate(hd, re, old_hand, newHand)
    }
    if (hd.type === 'Triple Draw 2-7 Lowball Limit') {
      toTdAndPopulate(hd, re, old_hand, newHand)
    }
  }

  function toHoldemOmahaAndPopulate(hd, re, old_hand, newHand) {
    // hd.players = [
    //   ["seat #", "player name", "chips"],
    //   ["seat #", "player name", "chips"],
    //   ["seat #", "player name", "chips"]
    // ]
    // hd.blinds = [
    //   ["player name", "blind type", "amount"],
    //   ["player name", "blind type", "amount"]
    // ]
    let i = populateSeats(hd, re, old_hand, newHand, 3)
    i = populateBlinds(hd, re, old_hand, newHand, i, '*** HOLE CARDS ***\n')
    i = populateHands(hd, re, old_hand, newHand, i+1)
    // preflop
    i = populateAction(i, re, old_hand, newHand, hd, true)
    // flop
    i = populateHeading(old_hand, re.flop_line, newHand, i)
    i = populateAction(i, re, old_hand, newHand, hd, null)
    // turn
    i = populateHeading(old_hand, re.turn_line, newHand, i)
    i = populateAction(i, re, old_hand, newHand, hd, null)
    // river
    i = populateHeading(old_hand, re.river_line, newHand, i)
    i = populateAction(i, re, old_hand, newHand, hd, null)
    // showdown line
    i = populateShowdown(i, old_hand, re, newHand)
    // for winner and summary
    i = populateWinnerAndSummary(i, old_hand, re, newHand)

    // captures post
    let post = []
    for (let player in hd.check_preflop) {
      post.push(hd.check_preflop[player])
    }
    for (i; i < old_hand.lines.length; i++) {
      let m_fold = old_hand.lines[i].match(/Seat (\d): (.*) \(.*\) (.*)/)
      if (m_fold) {
        if (parseFloat(m_fold[3]) * -1 == parseFloat(hd.bb[2])) {
          for (let player in hd.fold_preflop) {
            if (m_fold[2] === player && player !== hd.bb[0]) {
              post.push(hd.fold_preflop[player])
            }
          }
        }
      }
    }
    post.forEach((player) => {
      let startStr = newHand.text.slice(0, hd.post_index)
      let endStr = newHand.text.slice(hd.post_index)
      let insert = player[1] + ': posts big blind $' + hd.bb[2] + '\n'
      hd.post_index = (startStr + insert).length
      newHand.text = startStr + insert + endStr
    })
  }

  function toTdAndPopulate(hd, re, old_hand, newHand) {
    let i = populateSeats(hd, re, old_hand, newHand, 3)
    i = populateBlinds(hd, re, old_hand, newHand, i+1, '*** DEALING HANDS ***\n')
    i = populateHands(hd, re, old_hand, newHand, i)
    // 1st betting round
    i = populateAction(i, re, old_hand, newHand, hd, true)
    // 1st draw
    i = populateHeading(old_hand, re.draw_line, newHand, i, '*** FIRST DRAW ***\n')
    i = toDrawAction(i, old_hand, re, newHand, hd)
    // 2nd betting around
    i = populateAction(i, re, old_hand, newHand, hd, null)
    // 2nd draw
    i = populateHeading(old_hand, re.draw_line, newHand, i, '*** SECOND DRAW ***\n')
    i = toDrawAction(i, old_hand, re, newHand, hd)
    // 3rd betting around
    i = populateAction(i, re, old_hand, newHand, hd, null)
    // 3rd draw
    i = populateHeading(old_hand, re.draw_line, newHand, i, '*** THIRD DRAW ***\n')
    i = toDrawAction(i, old_hand, re, newHand, hd)
    // 4th betting around
    i = populateAction(i, re, old_hand, newHand, hd, null)
    // showdown line
    i = populateShowdown(i, old_hand, re, newHand)
    // for winner and summary
    i = populateWinnerAndSummary(i, old_hand, re, newHand)
  }

  function populateSeats(hd, re, old_hand, newHand, i) {
    let seat_line
    for (i; i < old_hand.lines.length; i++) {
      hd.players = []
      seat_line = old_hand.lines[i].match(re.seat_line)
      if (seat_line) {
        hd.players.push([seat_line[1], seat_line[2], seat_line[3]])
        newHand.text += `Seat ${seat_line[1]}: ${seat_line[2]} ($${seat_line[4]} in chips)\n`
      } else {
        break
      }
    }
    return i
  }

  function populateBlinds(hd, re, old_hand, newHand, i, heading) {
    let blind_line
    for (i; i < old_hand.lines.length; i++) {
      blind_line = old_hand.lines[i].match(re.blind_line)
      if (blind_line) {
        blind_line[3] === "small" ? hd.sb = [blind_line[1], blind_line[3], blind_line[4]] : hd.bb = [blind_line[1], blind_line[3], blind_line[4]]
        newHand.text += `${blind_line[1]}: posts ${blind_line[3]} blind $${blind_line[4]}`
        if (blind_line[6]) {
          newHand.text += ' and is all-in'
        }
        newHand.text += '\n'
      } else {
        break
      }
    }
    hd.post_index = newHand.text.length
    newHand.text += heading
    return i
  }

  function populateHands(hd, re, old_hand, newHand, i) {
    let hand_line
    for (i; i < old_hand.lines.length; i++) {
      hand_line = old_hand.lines[i].match(re.hand_line)
      if (hand_line) {
        if (hand_line[3] === 'X') {
          continue
        }
        hd.hero = hand_line[1]
        if (hd.type === "Hold'em Limit" || hd.type === "Hold'em No Limit") {
          newHand.text += `Dealt to ${hand_line[1]} [${hand_line[3]} ${hand_line[4]}]\n`
        } else if (hd.type === 'Omaha Hi/Lo Limit' || hd.type === "Omaha Pot Limit") {
          newHand.text += `Dealt to ${hand_line[1]} [${hand_line[3]} ${hand_line[4]} ${hand_line[6]} ${hand_line[7]}]\n`
        } else if (hd.type === 'Triple Draw 2-7 Lowball Limit') {
          newHand.text += `Dealt to ${hand_line[1]} [${hand_line[3]} ${hand_line[4]} ${hand_line[6]} ${hand_line[7]} ${hand_line[9]}]\n`
          hd.hand = [hand_line[3], hand_line[4], hand_line[6], hand_line[7], hand_line[9]]
        }
      } else {
        break
      }
    }
    return i
  }

  function populateHeading(old_hand, re, newHand, i, heading) {
    let headingExists = old_hand.lines[i].match(re)
    if (headingExists) {
      if (heading) {
        newHand.text += heading
      } else {
        newHand.text += `${headingExists[0]}\n`
      }
      i+=1
    }
    return i
  }

  function populateAction(i, re, old_hand, newHand, hd, hasBlinds) {
    let actionArr = toBettingAction(i, re, old_hand, hd, hasBlinds)
    i = actionArr[0]
    newHand.text += actionArr[1]
    return i
  }

  function populateShowdown(i, old_hand, re, newHand) {
    let showdown_declared = false
    let show_line
    // this did not capture MW showdowns
    // if (!(old_hand.lines[i].match(/(.*) shows \[(.*)\]/))) {
    if (old_hand.lines[i].match(re.winner_1) || old_hand.lines[i].match(re.winner_2)) {
      // A) no showdown
      i -= 2
    }
    for (i; i < old_hand.lines.length; i++) {
      show_line = old_hand.lines[i].match(re.show_line)
      if (show_line) {
        if (!(showdown_declared)) {
          newHand.text += '*** SHOW DOWN ***\n'
          showdown_declared = true
        }
        newHand.text += `${show_line[1]}: shows ${show_line[3]}\n`
      } else {
        if (!(showdown_declared)) {
          // A) no showdown
          i += 2
        } else {
          // probably leave blank
        }
        break
      }
    }
    return i
  }

  function populateWinnerAndSummary(i, old_hand, re, newHand) {
    let pot_total = 0
    let rake = 0
    let rake_line = old_hand.lines[(old_hand.lines.length -1)].match(re.rake_line) || 
      old_hand.lines[(old_hand.lines.length -2)].match(re.rake_line) ||
      old_hand.lines[(old_hand.lines.length -3)].match(re.rake_line)
    if (rake_line) {
      rake = parseFloat(rake_line[1])
      pot_total += rake
    }

    let side_line = old_hand.lines[i].match(/(.*) wins side pot 1 \((.*)\)/)
    if (side_line) {
      newHand.text += `${side_line[1]} collected $${side_line[2]} from side pot\n`
      i+=1
    }

    // winner line
    let winner_line_1 = old_hand.lines[i].match(re.winner_line_1)
    let winner_line_2 = old_hand.lines[i].match(re.winner_line_2)   
    for (i; i < old_hand.lines.length; i++) {
      winner_line = old_hand.lines[i].match(re.winner_line_1) || old_hand.lines[i].match(re.winner_line_2)
      if (winner_line) {
        newHand.text += `${winner_line[1]} collected $${winner_line[3]} from pot\n`
        pot_total += parseFloat(winner_line[3].replace(',', ''))
      } else {
        break
      }
    }
    newHand.text += "*** SUMMARY ***\n"
    if (side_line) {
      newHand.text += `Total pot $${pot_total+parseFloat(side_line[2])}. Main pot $${pot_total-rake}. Side pot $${side_line[2]}. | Rake $${rake}\n`
    } else {
      newHand.text += `Total pot $${pot_total} | Rake $${rake}\n`
    }
    return i+1
  }

  function toBettingAction(i, re, old_hand, hd, hasBlinds) {
    hd.hasSideLine = false
    let result = ''
    let action_line, show_line
    let last_bet = 0
    let playersAction = {}
    let j = 0
    if (hasBlinds) {
      if (hd.sb) {
        playersAction[hd.sb[0]] = parseFloat(hd.sb[2])
        last_bet = parseFloat(hd.sb[2])
      }
      if (hd.bb) {
        playersAction[hd.bb[0]] = parseFloat(hd.bb[2])
        last_bet = parseFloat(hd.bb[2])
      }
    }
    for (i; i < old_hand.lines.length; i++) {
      action_line = old_hand.lines[i].match(re.action_line)
      show_line = old_hand.lines[i].match(re.show_line)
      if (show_line) {
        // basically an all-in occured
        // will have to fix if more than 3 hands shown
        j+= 2
      }
      if (action_line) {
        // to capture posting
        if (hasBlinds) {
          hd.fold_preflop = hd.fold_preflop || {}
          hd.call_preflop = hd.call_preflop || {}
          hd.check_preflop = hd.check_preflop || {}
          if (action_line[3] === 'calls') {
            hd.call_preflop[action_line[1]] = action_line
            if (hd.check_preflop[action_line[1]]) {
              if (action_line[1] !== hd.bb[0]) {
                // action_line[4] 
                action_line[4] = ' ' + parseFloat(hd.bb[2])
                action_line[5] = '' + parseFloat(hd.bb[2])
              }
            }
          }
          if (action_line[3] === 'checks' && action_line[1] !== hd.bb[0]) {
            hd.check_preflop[action_line[1]] = action_line
          }
          if (action_line[3] === 'folds' && action_line[1] !== hd.bb[0]) {
            if (!(hd.call_preflop[action_line[1]])) {
              if (!(hd.check_preflop[action_line[1]])) {
                hd.fold_preflop[action_line[1]] = action_line
              }
            }
          }
        }
        result += `${action_line[1]}:`
        // check if action is a raise or other condition
        if (action_line[3] === 'raises to') {
          result += ` raises $${last_bet} to $${action_line[5]}`
          playersAction[action_line[1]] = parseFloat(action_line[5])
          last_bet = parseFloat(action_line[5])
        } else {
          result += ` ${action_line[3]}`
          if (action_line[4] && action_line[3] === 'bets') {
            result += ` $${action_line[5]}`
            playersAction[action_line[1]] = parseFloat(action_line[5])
            last_bet = parseFloat(action_line[5])
          }
          if (action_line[4] && action_line[3] === 'calls') {
            if (playersAction[action_line[1]]) {
              result += ` $${parseFloat(action_line[5]) - playersAction[action_line[1]]}`
            } else {
              result += ` $${action_line[5]}`
            }
            playersAction[action_line[1]] = parseFloat(action_line[5])
          }
        }
        if (action_line[6]) {
          result += ' and is all-in'
        }
        result += '\n'
      } else {
        break
      }
    }
    return [i+j, result]
  }

  function toDrawAction(i, old_hand, re, newHand, hd) {
    let action_line_1, action_line_2, cardIndex
    let numRemoved = 0
    let newCards = []
    let hasAction = false
    for (i; i < old_hand.lines.length; i++) {
      action_line_1 = old_hand.lines[i].match(re.draw_action_line_1)
      action_line_2 = old_hand.lines[i].match(re.draw_action_line_2)
      if (action_line_1) {
        hasAction = true
        if (action_line_1[3] === 'draws') {
          newHand.text += `${action_line_1[1]} discards ${action_line_1[5]} cards\n`
        } else {
          if (hd.hero === action_line_1[1]) {
            newHand.text += `${action_line_1[1]}: stands pat on [${hd.hand.join(' ')}]\n`
          } else {
            newHand.text += `${action_line_1[1]}: stands pat\n`
          }
        }
      } else if (action_line_2) {
        hasAction = true
        for(let i=4;i<9;i++) {
          if (action_line_2[i] !== '') {
            cardIndex = hd.hand.indexOf(action_line_2[i])
            hd.hand.splice(cardIndex,1)
            newCards.push(action_line_2[i+5])
            numRemoved+=1
          }
        }
        newHand.text += `${action_line_2[1]} discards ${numRemoved} cards ${action_line_2[3]}\n`
        newHand.text += `Dealt to ${action_line_2[1]} [${newCards.join(' ')}] [${hd.hand.join(' ')}]\n`
        hd.hand = hd.hand.concat(newCards)
        numRemoved = 0
      } else {
        break
      }
    }
    return hasAction ? i+1 : i
  }
}
