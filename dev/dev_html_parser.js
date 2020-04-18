const fs = require('fs')
const path = require('path')
const files = fs.readdirSync('./onc_grabber/')
// const files = fs.readdirSync('./hands/')
const folder = './onc_grabber/'
// const folder = './hands/'
const folder_2 = './onc_grabber_done/'
const converter_onc = require('../extension/converter/converter_onc.js')

process(files)

async function process(files) {
  let fileIndex = 0
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    console.log(`1. File # ${fileIndex}: ${file}`)
    if (file === '.DS_Store') {
      fileIndex++
      continue
    }
    let fileStr = ''
    // let filename = `filename_${fileIndex}`
    let filename = `${file}_converted`
    let HHs = await getHand(file)
    let handIndex = 0
    for (let j = 0; j < HHs.length; j++) {
      let oldHandText = HHs[j]
      if (oldHandText === "") {
        handIndex++
        continue
      }
      let oldHand = filterHand(oldHandText)
      if (oldHand.lines.length <= 11) {
        handIndex++
        continue
      }
      const newHand = converter_onc.convertOnc(oldHand, true)
      if (newHand.display) {
        fileStr += newHand.text + '\n'
      }
      handIndex++
    }

    // UNCOMMENT THIS LINE
    await saveFile(folder_2, filename, fileStr)
    fileIndex++
  }


  // files.forEach((file, fileIndex) => {
  //   if (file === '.DS_Store') {
  //     return
  //   }
  //   let fileStr = ''
  //   let filename = `filename_${fileIndex}`
  //   getHand(file).forEach((oldHandText, handIndex) => {
  //     if (oldHandText === "") {
  //       return
  //     }
  //     // if (handIndex === 1) {
  //       let oldHand = filterHand(oldHandText)
  //       if (oldHand.lines.length <= 11) {
  //         return
  //       }
  //       const newHand = converter_onc.convertOnc(oldHand, true)
  //       if (newHand.display) {
  //         fileStr += newHand.text + '\n'
  //       }
  //     // }
  //   })
    // await saveFile(folder_2, filename, fileStr)
  // })
}

function populateOldHand(text) {
  return {
    text: text,
    lines: text.split(/\n/),
    error: null
  }
}

async function getHand(file) {
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

async function saveFile(folder_2, filename, fileStr) {
  fs.writeFileSync(`${folder_2}${filename}.txt`, fileStr)
  console.log(`${filename} was a success!`)
  return

  // await fs.writeFile(`${folder_2}${filename}.txt`, fileStr, function (err) {
  //   if (err) return console.log(err);
  //   return console.log(`${filename} was a success!`);
  // })
}