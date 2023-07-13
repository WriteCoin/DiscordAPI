import { config } from "dotenv"
import { getChannels, getGuilds, getMessages } from "./messages.js"
import {
    authorName,
    getAuthorizeCommonHeaders,
    getToken,
    getUrl,
    guildName,
    lastDate,
    lastDateOnChannels,
    maxLimit,
    setToken,
} from "../general.js"
import fs from "fs"
import os from "os"
import path from "path"
import axios from "axios"
import querystring from "querystring"

config()
setToken(process.env.ACCESS_TOKEN)

const homeDir = os.homedir()
const messagesDir = path.join(
    homeDir,
    "Sync\\Документы\\WriteCoin's History\\Discord\\Сообщения RightCoin на XGM\\messages5"
)

const retryTime = 2000

const comparedDate = new Date(2023, 6, 5)

console.log("Получение списка серверов")

const guilds = await getGuilds(getToken())

fs.writeFileSync(`./data/${authorName}_guilds.json`, JSON.stringify(guilds), {
    encoding: "utf-8",
})

const guild = guilds.filter((g) => g.name === guildName)[0]

console.log("Получение списка каналов сервера")

const channels = await getChannels(getToken(), guild.id)

fs.writeFileSync(
    `./data/${guild.name}_channels.json`,
    JSON.stringify(channels),
    { encoding: "utf-8" }
)

// console.log("Тест получения сообщений")
// const messagesTest = await axios.get("https://discord.com/api/channels/543458160405512193/messages", {
//     headers: getAuthorizeCommonHeaders(getToken())
// })
// console.log("Количество полученных сообщений", messagesTest.data.length)

// process.exit()

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function writeMessages(channel, messages) {
    fs.writeFileSync(
        `${messagesDir}\\${channel.name}_messages.json`,
        JSON.stringify(messages),
        { encoding: "utf-8" }
    )
}

function writeDeletedMessages(channel, messages) {
    fs.writeFileSync(
        `${messagesDir}\\${channel.name}_deleted_messages.json`,
        JSON.stringify(messages),
        { encoding: "utf-8" }
    )
}

function writeHandleResult(channel, getCount, deleteCount) {
    // первый элемент - количество полученных
    // второй элемент - количество удаленных
    fs.writeFileSync(
        `${messagesDir}\\${channel.name}_result.json`,
        JSON.stringify([getCount, deleteCount]),
        { encoding: "utf-8" }
    )
}

async function deleteMessage(message, channel, channelDeletedMyMessages, isRetry) {
    const date = new Date(message.timestamp)

    const lastComparedDate = lastDate || lastDateOnChannels[channel.name]

    if (date < lastComparedDate) {
        return false
    }

    if (date < comparedDate) {
        try {
            const deleteResponse = await axios.delete(
                getUrl(`/channels/${channel.id}/messages/${message.id}`),
                {
                    headers: getAuthorizeCommonHeaders(getToken()),
                }
            )

            channelDeletedMyMessages.push(message)
        } catch (error) {
            console.error(`Ошибка удаления сообщения с ID ${message.id}`)
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log("Data", error.response.data)
                console.log("Status", error.response.status)
                // console.log("Headers", error.response.headers)
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                // console.log("Request", error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message)
            }
            // console.log("Config", error.config)

            if (
                error.response &&
                error.response.status === 429 &&
                error.response.data.code === 20028
            ) {
                console.error(
                    "Ошибка, связанная со слишком частым удалением. Попытка снова"
                )
                await sleep(retryTime)
                return await deleteMessage(
                    message,
                    channel,
                    channelDeletedMyMessages,
                    true
                )
            }
        }
    }
    if (isRetry) {
        await sleep(retryTime)
    }
    return true
}

async function handleMessages(
    channel,
    channelMyMessages,
    forbiddenChannels,
    channelDeletedMyMessages
) {
    let messages
    let lastMessageId
    let isContinue = true
    // цикл обработки сообщений канала
    do {
        lastMessageId = messages
            ? messages[messages.length - 1].id
            : lastMessageId
        try {
            const paramsObject = lastMessageId
                ? {
                      limit: maxLimit,
                      before: lastMessageId,
                  }
                : { limit: maxLimit }
            // const qs = querystring.stringify(paramsObject)
            // const fullUrl = `${getUrl(
            //     `/channels/${channel.id}/messages`
            // )}?${qs}`
            // console.log(`URL получения сообщений ${fullUrl}`)
            const params = new URLSearchParams(paramsObject)
            messages = await getMessages(getToken(), channel.id, params)
        } catch (error) {
            console.error("Ошибка при получении сообщений")
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.log("Data", error.response.data)
                // console.log("Status", error.response.status)
                // console.log("Headers", error.response.headers)
                if (error.response.statusText === "Forbidden") {
                    console.error(`Запрещенный доступ к каналу ${channel.name}`)
                    forbiddenChannels.push(channel)
                }
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                // console.log("Request", error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                // console.log("Error", error.message)
            }
            // console.log("Config", error.config)
            throw new Error("Ошибка при получении сообщений")
        }

        const myMessages = messages.filter(
            (message) => message.author.username === authorName
        )

        for (const message of myMessages) {
            channelMyMessages.push(message)

            isContinue = await deleteMessage(
                message,
                channel,
                channelDeletedMyMessages
            )

            if (!isContinue) {
                break
            }
        }
    } while (
        isContinue &&
        messages.length > 0 &&
        lastMessageId !== messages[messages.length - 1].id
    )
}

let forbiddenChannels = []
let allChannelMyMessages = {}
let allChannelDeletedMyMessages = {}

console.log("Начало работы алгоритма")

// цикл итерации по каналам
for (const channel of channels) {
    allChannelMyMessages[channel.name] = []
    let channelMyMessages = allChannelMyMessages[channel.name]
    allChannelDeletedMyMessages[channel.name] = []
    let channelDeletedMyMessages = allChannelDeletedMyMessages[channel.name]

    try {
        console.log(`Обработка сообщений канала "${channel.name}"`)

        await handleMessages(
            channel,
            channelMyMessages,
            forbiddenChannels,
            channelDeletedMyMessages
        )

        console.log(
            `Обработка сообщений канала "${channel.name}" прошла успешно`
        )
        writeMessages(channel, channelMyMessages)
        writeDeletedMessages(channel, channelDeletedMyMessages)
    } catch (e) {
        console.error(`Ошибка в отношении канала "${channel.name}"`)
        writeMessages(channel, channelMyMessages)
        writeDeletedMessages(channel, channelDeletedMyMessages)
    } finally {
        console.log(
            `Количество полученных сообщений: ${channelMyMessages.length}`
        )
        console.log(
            `Количество удаленных сообщений: ${channelDeletedMyMessages.length}`
        )
        writeHandleResult(
            channel,
            channelMyMessages.length,
            channelDeletedMyMessages.length
        )
    }
}

console.log("Запись запрещенных каналов")

fs.writeFileSync(
    "./xgm-forbidden-channels.json",
    JSON.stringify(forbiddenChannels),
    { encoding: "utf-8" }
)
