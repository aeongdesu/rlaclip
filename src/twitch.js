import { RefreshingAuthProvider } from "@twurple/auth"
import { ApiClient } from "@twurple/api"
import { ChatClient } from "@twurple/chat"
import { Deta } from "deta"

import clip from "./clip.js"

const cooldown = new Map()

export default async () => {
    const deta = Deta(process.env.DETA_KEY)
    const token = deta.Base("token")

    let accessToken = await token.get("token")
    if (!accessToken) accessToken = await token.put({
        accessToken: process.env.ACCESS_TOKEN,
        refreshToken: process.env.REFRESH_TOKEN,
        expiresIn: 0,
        obtainmentTimestamp: 0
    }, "token")

    const authProvider = new RefreshingAuthProvider({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        onRefresh: async (id, data) => accessToken = await token.put(data, "token")
    })

    await authProvider.addUserForToken(accessToken, ["chat", "clip"])

    const api = new ApiClient({ authProvider })
    api.db = deta.Base("clips")

    const chat = new ChatClient({
        authProvider: authProvider,
        channels: ["r1arkgus", "rlarkgus_osu"]
    })

    chat.onMessage(async (channel, user, message, msg) => {
        const reply = async (content) => await chat.say(channel, content, { replyTo: msg })
        if (message === "!클립") {
            const down = cooldown.get(channel)
            if (down !== undefined && Date.now() < down) return reply("ㅁㄴㅇㄹ")
            cooldown.set(channel, Date.now() + 10 * 1000)
            return clip(channel.replace("#", ""), api, reply)
        }
    })

    chat.onConnect(() => console.log("Connected to chat!"))

    chat.connect()

    return { TwitchApi: api, deta }
}