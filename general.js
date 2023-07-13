let token

export const getToken = () => token

export const setToken = (tokenValue) => {
    token = tokenValue
}

export const getUrl = (url) => `https://discord.com/api${url}`

export const getAuthorizeHeaders = (access_token) => {
    return {
        Authorization: `Bearer ${access_token}`,
    }
}

export const getAuthorizeCommonHeaders = (access_token) => {
    return {
        Authorization: access_token,
        'User-Agent': process.env.USER_AGENT
    }
}

export const guildName = "XGM"

export const authorName = "unfoldedrogue"

// макс. лимит сообщений для чтения с канала
export const maxLimit = 100

// 
// export const lastDate = new Date(2023, 5, 18)
export let lastDate

// пометка до каких дат читать сообщения оговоренных каналов. Если задано значение выше, этот параметр не учитывается
export const lastDateOnChannels = {
    "warcraft-3": new Date(2020, 10, 2),
    "чат": new Date(2021, 1, 11),
    "моддинг": new Date(2021, 1, 25),
    "игры": new Date(2021, 1, 13),
    "software": new Date(2020, 11, 7),
    "hardware": new Date(2022, 5, 22),
    "gamedev": new Date(2020, 11, 16),
    "галерея": new Date(2022, 3, 15),
    "clicli": new Date(2023, 2, 7),
    "anime": new Date(2021, 1, 8),
    "ментальная-качалка": new Date(2020, 11, 7),
    "world-editor": new Date(2020, 10, 3),
    "игры-blizzard-без-warcraft3": new Date(2022, 3, 6),
    "xgm-irinabot": new Date(2022, 6, 21),
    "лобби": new Date(2021, 1, 28)
}