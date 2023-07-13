import { Router } from "express";
import { getChannels, getGuilds } from "../../DeleteAndSaveMessages/messages.js";
import { getToken, guildName } from "../../general.js";

export const router = new Router()

router.get('/messages', async (req, res) => {
    const guilds = await getGuilds(getToken())

    const guild = guilds.filter(g => g.name === guildName)[0]

    // res.json(guild.id)

    // return

    const channels = await getChannels(getToken(), guild.id)
    
    res.json(channels)
})