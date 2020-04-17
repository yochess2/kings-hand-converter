const fs = require('fs')
const path = require('path')
const files = fs.readdirSync('./onc_grabber/')
// const files = fs.readdirSync('./hands/')
const folder = './onc_grabber/'
// const folder = './hands/'
const folder_2 = './onc_grabber_done/'
const converter_onc = require('../extension/converter/converter_onc.js')

files.forEach((file, fileIndex) => {
  if (file === '.DS_Store') {
    return
  }
  let fileStr = ''
  let filename = `filename_${fileIndex}`
  getHand(file).forEach((oldHandText, handIndex) => {
    if (oldHandText === "") {
      return
    }
    // if (handIndex === 1) {
      let oldHand = filterHand(oldHandText)
      if (oldHand.lines.length <= 11) {
        return
      }
      const newHand = converter_onc.convertOnc(oldHand, true)
      if (newHand.display) {
        fileStr += newHand.text + '\n'
      }
    // }
  })
  // saveFile(folder_2, filename, fileStr)
})

function populateOldHand(text) {
  return {
    text: text,
    lines: text.split(/\n/),
    error: null
  }
}

function getHand(file) {
  const text = fs.readFileSync(path.resolve(__dirname, folder, file), 'utf8')
  return text.split('EOH')
}

function filterHand(oldHandText) {
  let hand = {
    text: '',
    lines: [],
    error: null
  }
  let gibberish = oldHandText
    .replace(/\<span class\=blackheader\>/ig, '')
    .replace(/\<br\>/ig, '')
    .replace(/\</ig, '')
    .replace(/\>/ig, '')
    .split(/span/)

  gibberish.forEach((line) => {
    line = line.slice(0,line.length-1)
    if (line === '') {
      return
    }
    if (line === ' **' || line === '** ' || line === '**') {
      return
    }
    let img_matching = line.match(/img src\=.*hspace\=\d(.*)/)
    if (img_matching) {
      if (img_matching[1] === '') {
        return
      }
      let align_matching = img_matching[1].match(/\s*align\=absmiddle(.*)/)
      if (align_matching) {
        if (align_matching[1] === '') {
          return
        }
        hand.lines.push(align_matching[1])
        hand.text += align_matching + '\n'
        return
      }
      hand.lines.push(img_matching[1])
      hand.text += img_matching[1] + '\n'
      return
    }
    hand.lines.push(line)
    hand.text += line + '\n'
  })
  return hand
} 

function saveFile(folder_2, filename, fileStr) {
  fs.writeFile(`${folder_2}${filename}.txt`, fileStr, function (err) {
    if (err) return console.log(err);
    // console.log(`${filename} was a success!`);
  })
}