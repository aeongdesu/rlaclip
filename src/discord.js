export default async (clip_url) => {
    const webhook = await fetch(process.env.DISCORD_WEBHOOK + "?wait=true&thread_id=1110834334082027590", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: clip_url
        })
    }).catch(console.error)
    if (!webhook.ok) return
    const json = await webhook.json()
    let proxy_url = json.embeds[0]?.video?.proxy_url
    if (!proxy_url) proxy_url = await new Promise((resolve, reject) => {
        let count = 0
        const interval = setInterval(async () => {
            const message = await fetch(process.env.DISCORD_WEBHOOK + "/messages/" + json.id + "?thread_id=1110834334082027590", {
                headers: {
                    "Content-Type": "application/json"
                }
            }).catch(console.error)
            if (!message.ok) return reject()
            const json2 = await message.json()
            const proxy_url = json2.embeds[0]?.video?.proxy_url
            if (!proxy_url) {
                if (count === 20) return reject()
                return count++
            }
            clearInterval(interval)
            resolve(proxy_url)
        }, 1500)
    })
    return proxy_url
}