import os from 'os'
import path from 'path'
import querystring from "querystring";

const homeDir = os.homedir()
const messagesDir = path.join(homeDir, 'Sync\\Документы\\WriteCoin\'s History\\Discord\\Сообщения WriteCoin на XGM\\messages')

// fs.writeFileSync(messagesDir + '\\test.txt', 'text', { encoding: 'utf-8'})
// process.exit()

const timestamp = "2023-07-02T20:36:57.987000+00:00"

const date = new Date(timestamp)

console.log(date)

const date1 = new Date("2023-07-02T20:36:57.987Z");
const date2 = new Date("2023-07-02T15:12:34.567Z");

if (date1 > date2) {
  console.log("date1 is greater than date2");
} else if (date1 < date2) {
  console.log("date1 is less than date2");
} else {
  console.log("date1 is equal to date2");
}

let lastMessageId

const url = "https://discord.com/api/channels/123/messages"
const params = {
    limit: 100,
    before: lastMessageId || undefined
}

const qs = querystring.stringify(params)
const fullUrl = `${url}?${qs}`

console.log(fullUrl)