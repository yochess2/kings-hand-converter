const fs = require('fs')
const path = require('path')
const files = fs.readdirSync('./hands/')
const folder = './hands/'
const converter = require('../extension/converter/converter_kings.js')
// const converter_onc = require('../extension/converter/converter_onc.js')


files.forEach((file, fileIndex) => {
  if (file === '.DS_Store') {
    return
  }
  getHand(file).forEach((oldHandText, handIndex) => {
    if (oldHandText === "") {
      return
    }
    // if (handIndex === 0) {
      const oldHand = populateOldHand(oldHandText)
      const newHand = converter.convert(oldHand, true)
      // const newHand = converter_onc.convertOnc(oldHand, true)
      if (newHand.display) {
        console.log(newHand.text)
      }
    // }
  })
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
  return hands = text.replace(/\r/g, '').split('\n\n\n')
}
