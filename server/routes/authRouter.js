import { Router } from "express"
import axios from "axios"
import { setToken } from "../../general.js"
import { config } from "dotenv";

export const router = new Router()

config()
setToken(process.env.ACCESS_TOKEN)

router.get("/login", async (req, res) => {
    const url = process.env.DISCORD_URL

    res.redirect(url)
})

router.get("/callback", async (req, res) => {
    if (!req.query.code) {
        throw new Error("Code не доставлен")
    }

    try {
        const { code } = req.query

        const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
        })

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Encoding": "application/x-www-form-urlencoded",
        }

        const response = await axios.post(
            "https://discord.com/api/oauth2/token",
            params,
            { headers }
        )

        setToken(response.data.access_token)

        const userResponse = await axios.get(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${response.data.access_token}`,
                },
            }
        )

        res.json({
            authData: response.data,
            userData: userResponse.data,
        })
    } catch (e) {
        console.error(e)
    }
})
