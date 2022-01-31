const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const scriptname = GetCurrentResourceName()
const json = JSON.parse(LoadResourceFile(scriptname, 'requests.json'))

client.on("ready", () => {
  console.log('bot on')
  client.setInterval(checkTimestamps, 30000)
})

function checkRole(gid, uid, rid) { // funkcja odpowiada za sprawdzanie czy uzytkownik ma podana role
  var gowno = false
  if(!gid || !uid || !rid) return console.log("missing arguments!")
  if(client.guilds.get(gid).members.get(uid).roles.get(rid)) gowno = true 
  return gowno
}

function checkTimestamps() { // funkcja odpowiada za usuwanie przedawnionych kodow
  for(let i in json) {
    let timestamp = json[i].timestamp
    if(Date.now() / 1000 > timestamp) {
      delete json[i]
    }
  }
  SaveResourceFile(scriptname, 'requests.json', JSON.stringify(json, null, 4), -1)
}

function genCode() { return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000 } // funkcja odpowiadajaca za wygenerowanie kodu

function getUser(gid, uid) { // funkcja odpowiada za zdobycie informacji o uzytkowniku
  if (!gid || !uid) return console.log("missing arguments!")
  let guild = client.guilds.get(gid)
  if(!guild) return console.log('# podany guild nie został znaleziony')
  let member = guild.members.get(uid)
  if(!member) return false; else return true
}

function createJSON(userid, code) { // funkcja odpowiadajaca za stworzenie objectu w pliku json
  if(json[userid] && json[userid].remember == false) {
    delete json[userid]
    SaveResourceFile(scriptname, 'requests.json', JSON.stringify(json, null, 4), -1)
  } else {
      json[userid] = {
        code: code,
        remember: false,
        timestamp: Math.floor(Date.now() + 21600000) / 1000
      }
      SaveResourceFile(scriptname, 'requests.json', JSON.stringify(json, null, 4), -1)
  }
}

function checkRM(userid) { // funkcja odpowiadajaca za sprawdzanie czy uzytkownik zapamietal juz wczesniej swoj kod
  if(!userid) return console.log("missing arguments!")
  if(!json[userid]) return 
  return json[userid].remember
}

function updateJSON(userid, code) { // funkcja odpowiadajaca za nadpisywanie objectu w pliku json
  if(json[userid]) return; else {
    json[userid].remember = true
    SaveResourceFile(scriptname, 'requests.json', JSON.stringify(json), -1)
  }
}

function sendLog(channel, embed, message) { // funckcja odpowiadajaca za wysyłanie wiadomosic gdy ktos polaczy sie z serwerem
  if(!channel || !message) return console.log("missing arguments!")
  let channell = client.channels.get(channel)
  if(!channell) return console.log('[SENDLOG]: kanał o id ' + channel + ' nie został znaleziony')
  if(embed == true) {
    const embed = new Discord.RichEmbed().setAuthor('Kolejka - Logi').setTitle('Uzytkownik łączy sie z serwerem').setColor('#00ff48').setDescription(message)
    return channell.send(embed).catch((err) => {
      throw err;
    })
  } else {
    channell.send(message).catch((err) => {
      throw err;
    })
  }
}

function deleteJSON(userid) { // funkcja odpowiadajaca za usuwanie objectu gdy uzytkownik juz sie polaczy i nie zapamietal kodu
  if(!userid) return console.log("missing arguments!")
  if(!json[userid]) return
  delete json[userid]
  SaveResourceFile(scriptname, 'requests.json', JSON.stringify(json), -1)
}

function checkCode(userid, code) { // funkcja sprawdzajaca czy podany kod jest prawidłowy
  var valid = true
  if(!userid || !code) return console.log("missing arguments!")
  if(json[userid].code != code) valid = false
  return valid
}

function sendVerifyCode(gid, uid, code)  { // funkcja odpowiadajaca za wyslanie wiadomosci z kodem do uzytkownika
  if(!gid || !uid || !code) return console.log("missing arguments!")
  let member = client.guilds.get(gid).members.get(uid)
  if(member) console.log('znaleziono uzytkownika'); else {
    return console.log('nie znaleziono uzytkownika')
  }
  member.send('Twój kod weryfikacyjny: ``' + code + '``').catch(() => {})
}

module.exports = { checkRole, getUser, genCode, checkRM, createJSON, updateJSON, sendLog, deleteJSON, checkCode, sendVerifyCode }

client.login(config.token).catch(() => { console.log('bot: podany token jest nieprawidłowy')})
