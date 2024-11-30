import {Hono} from "hono"
import {DestinyManifestLanguage, HttpClient, HttpClientConfig} from "bungie-api-ts/destiny2"
import {getUserActivityHistoryInTime} from "./history_getter"
import {getActivityManifest} from "./activity_manifest"

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

    // construct a date of 7 days ago
    const time = new Date()
    time.setDate(time.getDate() - 7)

    try {
        const data = await getUserActivityHistoryInTime(client, mType, mId, time)
        return c.json({
            code: 0,
            message: "ok",
            data: data,
        }, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH, POST",
                "Access-Control-Max-Age": "86400",
            }
        })
    } catch(e) {
        console.error(e)
        return c.json({
            code: 2,
            message: "internal error",
            error: e,
        }, 500)
    }
})

app.get("/v1/get-activity-definitions/:language?", async (c) => {
    const client = createHttpClient(c.env.BUNGIE_API_KEY)

    const defaultLanguage: DestinyManifestLanguage = "zh-cht"
    const language = c.req.param("language") ?? defaultLanguage

    try {
        const definitions = await getActivityManifest(client, language)
        return c.json({
            code: 0,
            message: "ok",
            data: definitions,
        })
    } catch(e) {
        return c.json({
            code: 1,
            message: "internal error",
            error: e,
        }, 500)
    }
})

export default app
