import {
    DestinyManifestLanguage,
    destinyManifestLanguages,
    getDestinyManifest,
    getDestinyManifestComponent,
    HttpClient,
} from "bungie-api-ts/destiny2"

export async function getActivityManifest(cli: HttpClient, lang: string) {
    const manifestResp = await getDestinyManifest(cli)
    if(manifestResp.ErrorCode !== 1) return Promise.reject(manifestResp.Message)

    const manifest = manifestResp.Response

    if(lang !in destinyManifestLanguages) {
        return Promise.reject("invalid language")
    }

    return await getDestinyManifestComponent(cli, {
        language: lang as DestinyManifestLanguage,
        destinyManifest: manifest,
        tableName: "DestinyActivityDefinition",
    })
}