import express from "express"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import discord from "../discord.js"

const path = dirname(fileURLToPath(import.meta.url))

const streamers = [
    "134352671",
    "789609081"
]

export default async ({ TwitchApi, deta }) => {
    const app = express()
    app.set("view engine", "ejs")
    app.set("views", path)
    const clips = deta.Base("clips")
    app.get("/", async (req, res) => res.status(200).send({
        main: "https://twitch.tv/r1arkgus",
        sub: "https://twitch.tv/rlarkgus_osu",
        example: `https://${req.headers.host}/ExpensiveAmorphousBulgogiRedCoat-e13BRK_mNOejHfjb`,
        creator: "https://twitch.tv/aeongdesu"
    }))

    app.get("/:clipid", async (req, res) => {
        const clipid = req.params.clipid
        if (clipid.includes(".")) return res.sendStatus(404)
        let { items: clip } = await clips.fetch({ id: clipid })
        if (clip.length === 0 || !clip[0]?.proxy_url) {
            try {
                const info = await TwitchApi.asIntent(["clip"], async ctx => await ctx.clips.getClipById(clipid))
                if (!info) return res.status(404).send("클립을 찾을 수 없어요.")
                if (!streamers.find(s => s === info?.broadcasterId)) return res.status(404).send("김가구스 클립이 아니에요.")
                const proxy = await discord(info.thumbnailUrl.replace("-preview-480x272.jpg", ".mp4"))
                if (!proxy) return res.status(500).send("프록싱하는데 실패했어요.")
                await clips.put({ id: info.id, channel: info.broadcasterId, proxy_url: proxy, thumbnail_url: info.thumbnailUrl })
                clip = [{ id: info.id, proxy_url: proxy, thumbnail_url: info.thumbnailUrl }]
            } catch (e) {
                console.log(e)
                return res.status(404).send("클립을 불러오는데 실패했어요.")
            }
        }
        res.render("index", { id: clip[0].id, url: clip[0].proxy_url, thumbnail_url: clip[0].thumbnail_url })
    })
    app.listen(process.env.PORT || 3000, () => console.log("Frontend is running!"))
}