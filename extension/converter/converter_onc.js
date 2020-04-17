//hand comes in lines and text

// for development mode purposes
// module.exports = {
//   convertOnc: convertOnc
// }

function convertOnc(old_hand, show_error) {
  return convertHand(old_hand)
  function convertHand(old_hand, show_error) {
    const re = {
      hand_line: /^\*\*\*\*\* Hand History for hand : (\d+) \*\*\*\*\*$/i,
      game_date_line: /^(\w+) (Hold'em|OmahaHiLo) Blinds\((\d*\.?\,?\d*\.?\d+)\/(\d*\.?\,?\d*\.?\d+)\)  - (\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+) (AM|PM)$/i,
      table_line: /^Table (\d+)$/i,
      dealer_line: /^Seat (\d) is dealer$/i,
      players_line: /^Total no of players : (\d)$/i,
      seat_line: /^Seat (\d): (.*) \( (\d*\.?\,?\d*\.?\d+) \)(   \[SITOUT\])?$/i,
      blind_line: /^(.*) posts( missed)?( (Small) Blind| (Big) Blind)? \[(\d*\.?\,?\d*\.?\d+)\]$/i,
      dealt_line: /^(.*) dealt \[(\*|\w+)\,(\*|\w+)(\,(\*|\w+))?(\,(\*|\w+))?\]$/i,
      flop_line: /^\*\* Dealing (Flop) \*\*\[(\w+)\, (\w+)\, (\w+)\]$/i,
      turn_line: /^\*\* Dealing (Turn) \*\*\[(\w+)\]$/,
      river_line: /^\*\* Dealing (River) \*\*\[(\w+)\]$/,
      show_line: /(.*) (shows) \[(\w+) \, (\w+)( \, (\w+))?( \, (\w+))?\]/i,
      muck_line: /^(.*) mucks cards\.$/i,
      refund_line: /^(.*) was Refunded the Uncalled bet (\d*\.?\,?\d*\.?\d+) from pot.$/i,
      winner_line: /^(.*) wins (\d*\.?\,?\d*\.?\d+) from pot(.*)$/i,
      action_line: /^(.*) (folds|checks|calls|raises|bets)(\s*\[(\d*\.?\,?\d*\.?\d+)\])?\.$/i,
      main_line: /^Main Pot created with (\d*\.?\,?\d*\.?\d+)$/i,
      side_line: /^Side Pot \#(\d) created with (\d*\.?\,?\d*\.?\d+)$/i

    }
  	const hand_details = {
      convertable: false,
      error: false
    }
  	const new_hand = {
  	  display: false,
      error: false,
  	  text: ''
  	}

    old_hand.lines = filterLines(old_hand.lines)

    let index = 0
    if (old_hand.lines.length < 5) {
      hand_details.error = true
      new_hand.error = true
      return new_hand
    }
    index = populateHandDetails(hand_details, re, old_hand)
    if (hand_details.error) {
      new_hand.error = true
      if (hand_details.hand_number) {
        if (show_error) {
          console.error('populateHandDetails error: ' + hand_details.hand_number)
        }
      }
      return new_hand
    }
    if (!(isGameCoverage(hand_details))) {
      new_hand.display = false
      return new_hand
    }
    index = populatePlayers(hand_details, re, old_hand, index)
    if (hand_details.error) {
      if (show_error) {
        console.error('populatePlayers error')
      }
      new_hand.error = true
      return new_hand
    }
    index++
    index = getBlinds(hand_details, re, old_hand, index)
    if (hand_details.error) {
      if (show_error) {
        console.error('getBlinds error')
      }
      new_hand.error = true
      return new_hand
    }
    index = getHands(hand_details, re, old_hand, index)
    if (hand_details.error) {
      if (show_error) {
        console.error('getHands error, likely straddle: ' + hand_details.hand_number)
      }
      new_hand.error = true
      return new_hand
    }
    turnToStars(hand_details, re, old_hand, new_hand, index)
    // 262368 - side pot
    // 262788 - side pot - guy with chips wins both main and side pot
    // 263210 - side pot - allin wins main pot 

  	return new_hand
  }

  function filterLines(lines) {
    const result = []
    for (let index = 0; index < lines.length; index++) {
      let line = lines[index]
      if (line.match(/\>/)) {
        continue
      }
      if (line.match(/^\s/)) {
        continue
      }
      if (line.match(/left table.$/)) {
        continue
      }
      result.push(line)
    }

    return result
  }

  function populateHandDetails(hand_details, re, old_hand) {
    // hand_number: '255908',
    // game_type: [ 'BL', "Hold'em" ],
    // stakes: [ '6', '12' ],
    // date: [ '3', '30', '2020' ],
    // time: [ '2', '27', '59', 'AM' ],
    // table_name: 'Table 117',
    // dealer_num: '4',
    // players_count: '5'
    const matches = {}
    matches.hand_number = old_hand.lines[0].match(re.hand_line)
    matches.game_date = old_hand.lines[1].match(re.game_date_line)
    matches.table_name = old_hand.lines[2].match(re.table_line)
    matches.dealer_num = old_hand.lines[3].match(re.dealer_line)
    matches.players_count = old_hand.lines[4].match(re.players_line)
    let isMatches = true
    for (const key in matches) {
      const match = matches[key]
      if (!(match)) {
        isMatches = false
        break
      }
    }
    if (!(isMatches)) {
      hand_details.error = true
      if (matches.hand_number) {
        hand_details.hand_number = matches.hand_number[1]
      }
      return null
    }
    hand_details.hand_number = matches.hand_number[1]
    hand_details.game_type = [matches.game_date[1], matches.game_date[2]]
    hand_details.stakes = [matches.game_date[4], parseInt(parseFloat(matches.game_date[4]) * 2)+'']
    hand_details.date = [matches.game_date[5], matches.game_date[6], matches.game_date[7]]
    hand_details.time = [matches.game_date[8], matches.game_date[9], matches.game_date[10], matches.game_date[11]]
    hand_details.table_name = matches.table_name[0]
    hand_details.dealer_num = matches.dealer_num[1]
    hand_details.players_count = matches.players_count[1]
    return 5
  }

  function isGameCoverage(hand_details) {
    let result = false
    if (hand_details.game_type[0] === 'BL' && (hand_details.game_type[1] === "Hold'em" || hand_details.game_type[1] === "OmahaHiLo")) {
      hand_details.convertable = true
      hand_details.stars_game_type = "Hold'em Limit"
      if (hand_details.game_type[1] === 'OmahaHiLo') {
        hand_details.stars_game_type = "'Omaha Hi/Lo Limit'"
      }
      result = true
    }
    return result
  }

  function populatePlayers(hand_details, re, old_hand, index) {
    let players_count = parseInt(hand_details.players_count)
    let players = []
    let counter = 0
    let sitout_count = 0
    while (counter < players_count + sitout_count) {
      let sitout = false
      let player_match = old_hand.lines[index + counter].match(re.seat_line)
      if (!(player_match)) {
        hand_details.error = true
        return null
      }
      if (player_match[4]) {
        sitout_count += 1
        sitout = true
      }
      if (!(sitout)) {
        players[parseInt(player_match[1])] = {
          seat: player_match[1],
          name: player_match[2],
          amount: player_match[3]
        }

      }
      counter++
    }
    hand_details.players = []
    hand_details.players_lib = {}
    for (let player of players) {
      if (!(player)) {
        continue
      } 
      hand_details.players.push(player)
      hand_details.players_lib[player.name] = player
    }
    let player_match = old_hand.lines[index + counter].match(re.seat_line)
    while (player_match) {
      counter++
      player_match = old_hand.lines[index + counter].match(re.seat_line)
    }
    return index + counter
  }

  function getBlinds(hand_details, re, old_hand, index) {
    let blind_match = old_hand.lines[index].match(re.blind_line)
    if (!(blind_match)) {
      hand_details.error = true
      return null
    }
    hand_details.blinds = {}
    hand_details.blinds.posters = []
    hand_details.blinds.missed = {}
    while (blind_match) {
      if (blind_match[4]) {
        if (blind_match[2]) {
          if (!(hand_details.blinds.missed[blind_match[1]])) {
            hand_details.blinds.missed[blind_match[1]] = {}
          }
          hand_details.blinds.missed[blind_match[1]].sb = blind_match[6]
        } else {
          hand_details.blinds.sb = blind_match[1]
        }
      }
      if (blind_match[5]) {
        if (blind_match[2]) {
          if (!(hand_details.blinds.missed[blind_match[1]])) {
            hand_details.blinds.missed[blind_match[1]] = {}
          }
          hand_details.blinds.missed[blind_match[1]].bb = blind_match[6]
        } else {
          hand_details.blinds.bb = blind_match[1]
        }
      }
      if (!(blind_match[3])) {
        hand_details.blinds.posters.push(blind_match[1])
      }
      index++
      blind_match = old_hand.lines[index].match(re.blind_line)
    }
    return index
  }

  function getHands(hand_details, re, old_hand, index) {
    let hand_match = old_hand.lines[index].match(re.dealt_line)
    if (!(hand_match)) {
      hand_details.error = true
      return null
    }
    while (hand_match) {
      if (hand_match[2] !== '*') {
        hand_details.dealt = [hand_match[1], fixCards(hand_match[2]), fixCards(hand_match[3])]
        if (hand_details.game_type[1] === 'OmahaHiLo') {
          hand_details.dealt = [hand_match[1], fixCards(hand_match[2]), fixCards(hand_match[3]), fixCards(hand_match[5]), fixCards(hand_match[7])]
        }
      }
      index++
      hand_match = old_hand.lines[index].match(re.dealt_line)      
    }
    return index
  }

  function turnToStars(hd, re, old_hand, new_hand, index) {
    const getButtonLine = (num) => num ? ` Seat #${num} is the button` : ''
    const line_1 = `PokerStars Hand #${hd.hand_number}:  ${hd.stars_game_type} ($${hd.stakes[0]}/$${hd.stakes[1]} USD) - ${hd.date[0]}/${hd.date[1]}/${hd.date[2]} ${hd.time[0]}:${hd.time[1]}:${hd.time[2]} ${hd.time[3]}`
    const line_2 = `Table '${hd.table_name}'${getButtonLine(hd.dealer_num)}`
    const players_line = hd.players.map((player) => {
      return `Seat ${player.seat}: ${player.name} ($${player.amount} in chips)`
    }).join('\n')
    const sb_line = `${hd.blinds.sb}: posts small blind $${parseFloat(hd.stakes[0])/2}`
    const bb_line = `${hd.blinds.bb}: posts big blind $${parseFloat(hd.stakes[0])}`
    const poster_lines = hd.blinds.posters.map((poster) => {
      return `${poster}: posts big blind $${parseFloat(hd.stakes[0])}`
    })
    let missed_lines = []
    for (let player in hd.blinds.missed) {
      let blinds = hd.blinds.missed[player]
      if (blinds.sb && blinds.bb) {
        missed_lines.push(`${player}: posts small & big blinds $${parseFloat(blinds.sb) + parseFloat(blinds.bb)}`)
      } else if (blinds.sb && !(blinds.bb)) {
        missed_lines.push(`${player}: posts big blind $${parseFloat(blinds.sb)}`)
      } else {
        console.error('uncovered blinds so far!')
      }
    }
    new_hand.text += line_1 + '\n' + line_2 + '\n' + players_line + '\n' + sb_line + '\n' + bb_line + '\n' 
    if (poster_lines.length > 0) {
      new_hand.text += poster_lines.join('\n') + '\n'
    }
    if (missed_lines.length > 0) {
      new_hand.text += missed_lines.join('\n') + '\n'
    }
    const hole_line = '*** HOLE CARDS ***'
    if (!(hd.dealt)) {
      new_hand.text += hole_line + '\n'
    } else {
      let dealt_line = `Dealt to ${hd.dealt[0]} [${hd.dealt[1]} ${hd.dealt[2]}]`
      if (hd.game_type[1] === 'OmahaHiLo') {
        dealt_line = `Dealt to ${hd.dealt[0]} [${hd.dealt[1]} ${hd.dealt[2]} ${hd.dealt[3]} ${hd.dealt[4]}]`
      }
      new_hand.text += hole_line + '\n' + dealt_line + '\n'
    }
    // action
    index = populateAction(hd, re, old_hand, new_hand, index, 'flop_line')
    if (new_hand.side) {
      return
    }
    if (new_hand.mucked) {
      winnerLine(hd, re, old_hand, new_hand, index, {adj: 12})
      return
    }
    index = populateAction(hd, re, old_hand, new_hand, index, 'turn_line')
    if (new_hand.side) {
      return
    }
    if (new_hand.mucked) {
      winnerLine(hd, re, old_hand, new_hand, index, null)
      return
    }
    index = populateAction(hd, re, old_hand, new_hand, index, 'river_line')
    if (new_hand.side) {
      return
    }
    if (new_hand.mucked) {
      winnerLine(hd, re, old_hand, new_hand, index, null)
      return
    }
    index = populateAction(hd, re, old_hand, new_hand, index, 'show_line')
    if (new_hand.side) {
      return
    }
    if (new_hand.mucked) {
      winnerLine(hd, re, old_hand, new_hand, index, null)
      return
    }
    winnerLine(hd, re, old_hand, new_hand, index)
  }

  function fixCards(card) {
    if (card.length === 2) {
      return `${card[0]}${card[1].toLowerCase()}`
    } else {
      return `T${card[2].toLowerCase()}`
    }
  }

  function populateAction(hd, re, old_hand, new_hand, index, str) {
    let header_line = old_hand.lines[index].match(re[str])
    let muck_line = old_hand.lines[index].match(re.muck_line)
    hd.last_bet = 0
    while (!(header_line || muck_line)){
      header_line = old_hand.lines[index].match(re[str])
      muck_line = old_hand.lines[index].match(re.muck_line)
      if (muck_line) {
        new_hand.mucked = true
        index++
        let refund_line = old_hand.lines[index].match(re.refund_line)
        if (refund_line) {
          new_hand.text += `Uncalled bet ($${refund_line[2]}) returned to ${refund_line[1]}` + '\n'
          index++
        }
        break
      }
      if (header_line) {
        if (header_line[1].toLowerCase() === 'flop') {
          hd.flop = [fixCards(header_line[2]), fixCards(header_line[3]), fixCards(header_line[4])]
          new_hand.text += `*** FLOP *** [${hd.flop[0]} ${hd.flop[1]} ${hd.flop[2]}]` + '\n'
        } else if (header_line[1].toLowerCase() === 'turn') {
          hd.turn = fixCards(header_line[2])
          new_hand.text += `*** TURN *** [${hd.flop[0]} ${hd.flop[1]} ${hd.flop[2]}] [${hd.turn}]` + '\n'
        } else if (header_line[1].toLowerCase() === 'river') {
          hd.river = fixCards(header_line[2])
          new_hand.text += `*** RIVER *** [${hd.flop[0]} ${hd.flop[1]} ${hd.flop[2]} ${hd.turn}] [${hd.river}]` + '\n'
        } else if (header_line[2].toLowerCase() === 'shows') {
          new_hand.text += '*** SHOW DOWN ***' + '\n'
          if (hd.game_type[1] === 'OmahaHiLo') {
            new_hand.text += `${header_line[1]}: shows [${fixCards(header_line[3])} ${fixCards(header_line[4])} ${fixCards(header_line[6])} ${fixCards(header_line[8])}]` + '\n'
          } else {
            new_hand.text += `${header_line[1]}: shows [${fixCards(header_line[3])} ${fixCards(header_line[4])}]` + '\n'
          }
        } else { 
          console.error('something went wrong with action')
        }
        index++
        break
      }
      toBettingAction(hd, re, old_hand, new_hand, index, str)
      if (new_hand.side) {
        console.error('side pot: ' + hd.hand_number)
        return
      }
      index++
    }
    return index
  }

  function toBettingAction(hd, re, old_hand, new_hand, index, str) {
    let action_line = old_hand.lines[index].match(re.action_line)
    let main_line, side_line
    if (action_line) {
      let action = action_line[2]
      if (action === 'folds') {
        new_hand.text += `${action_line[1]}: folds` + '\n'
      } else if (action === 'checks') {
        new_hand.text += `${action_line[1]}: checks` + '\n'
      } else if (action === 'raises') {
        let raise_amount = 0
        if (str === 'flop_line' || str === 'turn_line') {
          raise_amount = parseFloat(hd.stakes[0])
          hd.last_bet += parseFloat(hd.stakes[0])
        } else {
          raise_amount = (parseFloat(hd.stakes[0]) * 2)
          hd.last_bet += (parseFloat(hd.stakes[0]) * 2)
        }
        new_hand.text += `${action_line[1]}: raises $${raise_amount} to $${raise_amount + hd.last_bet}` + '\n'
      } else if (action === 'calls') {
        new_hand.text += `${action_line[1]}: calls $${action_line[4]}` + '\n'
      } else if (action === 'bets') {
        new_hand.text += `${action_line[1]}: bets $${action_line[4]}` + '\n'
      } else {
        console.error('unhandled betting action')
      }
    }
    if (!(action_line)) {
      main_line = old_hand.lines[index].match(re.main_line)
      new_hand.side = true
      return
    }
    if (!(action_line || main_line)) {
      side_line = old_hand.lines[index].match(re.side_line)
    }
    if (!(action_line || main_line || side_line)) {
      console.error('something went wrong in betting action')
    }
  }

  function winnerLine(hd, re, old_hand, new_hand, index, bug) {
    let winner_line = old_hand.lines[index].match(re.winner_line)
    if (!(winner_line)) {
      console.error('no winner')
    }
    while (winner_line) {
      if (bug && bug.adj) {
        winner_line[2] -= parseFloat(hd.stakes[0])
      }
      if (winner_line[2] === 6 || winner_line[2] === 4) {
        winner_line[2] = parseFloat(hd.stakes[0])
      }
      new_hand.text += `${winner_line[1]} collected $${winner_line[2]} from pot` + '\n'
      index++
      if (old_hand.lines[index]) {
        winner_line = old_hand.lines[index].match(re.winner_line)
      } else {
        break
      }
    }
    new_hand.text += `*** SUMMARY ***` + '\n'
    new_hand.display = true
  }
}
