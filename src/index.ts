import {Hono} from "hono"
import {HttpClient, HttpClientConfig} from "bungie-api-ts/destiny2"
import {getUserActivityHistoryInTime} from "./history_getter"

const API_KEY = "573fc23726ac47468cbe69e0c1f6a792"

type EnvBindings = {
    BUNGIE_API_KEY: string,
}

const app = new Hono<{ Bindings: EnvBindings }>()

/**
 * Create a HttpClient for bungie-api-ts.
 *
 * @param key the bungie api key
 */
function createHttpClient(key: string): HttpClient {
    return async function(config: HttpClientConfig) {
        const url = new URL(config.url)
        for(let key in config.params) {
            url.searchParams.set(key, config.params[key])
        }

        const r = await fetch(url, {
            method: config.method,
            body: config.body,
            headers: {
                "X-API-Key": key,
            },
        })
        return await r.json()
    }
}

app.get("/", (c) => {
    return c.json({
        code: 0,
        message: "ok",
    })
})

app.get("/v1/get-history/:membershipType/:membershipId", async (c) => {
    const client = createHttpClient(c.env.BUNGIE_API_KEY)

    const mId = c.req.param("membershipId")
    const mType = parseInt(c.req.param("membershipType"))

    if(isNaN(mType)) {
        return c.json({
            code: 1,
            message: "invalid membership info",
        }, 400)
    }

    // construct a date of 3 days ago
    const time = new Date()
    time.setDate(time.getDate() - 7)

    try {
        const data = await getUserActivityHistoryInTime(client, mType, mId, time)
        return c.json({
            code: 0,
            message: "ok",
            data: data,
        })
    } catch(e) {
        console.error(e)
        return c.json({
            code: 2,
            message: "internal error",
            error: e,
        })
    }
})

export default app
