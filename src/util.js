/**
 * 
 * @param {import("@twurple/api").ApiClient} api 
 * @param {string} clipid 
 * @returns {Promise<import("@twurple/api").HelixClip>}
 */

export const getClipInfo = async (api, clipid) => await (new Promise((resolve, reject) => {
    let count = 0
    const interval = setInterval(async () => {
        const info = await api.asIntent(["clip"], async ctx => await ctx.clips.getClipById(clipid))
        if (!info) {
            if (count === 20) return reject()
            return count++
        }
        if (info.thumbnailUrl) {
            clearInterval(interval)
            resolve(info)
        }
    }, 1500)
}))