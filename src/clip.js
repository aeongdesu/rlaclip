import discord from "./discord.js"
import { getClipInfo } from "./util.js"

/**
 * @param {import("@twurple/api").ApiClient} api
 */
export default async (channel, api, reply) => {
    reply("클립을 만들고 있어요...")
    try {
        const user = await api.users.getUserByName(channel)
        if (!user) return reply("클립을 만드는데 실패했어요, 다시 시도해주세요.")
        if (!await user.getStream()) return reply("방송중이 아니에요.")
        const clip = await api.asIntent(["clip"], async ctx => await ctx.clips.createClip({ channel: user.id }))
        const clipInfo = await getClipInfo(api, clip)
        if (!clipInfo) return reply("클립을 만드는데 실패했어요, 다시 시도해주세요.")
        const proxy = await discord(clipInfo.thumbnailUrl.replace("-preview-480x272.jpg", ".mp4"))
        if (!proxy) return reply(`클립을 만들었으나 프록싱하는데 실패했어요! - ${clipInfo.url}`)
        await api.db.put({ id: clipInfo.id, channel: user.id, proxy_url: proxy, thumbnail_url: clipInfo.thumbnailUrl })
        return reply(`클립이 만들어졌어요! - https://rlaclip.aeong.one/${clipInfo.id}`)
    } catch (e) {
        console.log(e)
        return reply("클립을 만드는데 실패했어요.")
    }
}