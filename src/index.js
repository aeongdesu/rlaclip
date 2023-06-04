import "dotenv/config"

import twitch from "./twitch.js"
import front from "./front/index.js"

const clients = await twitch()
await front(clients)