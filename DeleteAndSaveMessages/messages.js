import axios from "axios"
import {
    getAuthorizeCommonHeaders,
    getAuthorizeHeaders,
    getUrl,
} from "../general.js"

export const getGuilds = async (token) => {
    const guildsResponse = await axios.get(getUrl("/users/@me/guilds"), {
        headers: getAuthorizeCommonHeaders(token),
    })

    return guildsResponse.data
}

export const getChannels = async (token, guildId) => {
    const channelsResponse = await axios.get(
        getUrl(`/guilds/${guildId}/channels`),
        {
            headers: getAuthorizeCommonHeaders(token),
        }
    )

    return channelsResponse.data
}

export const getMessages = async (token, channelId, params) => {
    const messagesResponse = await axios.get(
        getUrl(`/channels/${channelId}/messages`),
        {
            params,
            headers: getAuthorizeCommonHeaders(token),
        }
    )

    return messagesResponse.data
}
