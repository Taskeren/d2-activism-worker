import {
    BungieMembershipType,
    DestinyComponentType,
    DestinyHistoricalStatsPeriodGroup,
    getActivityHistory,
    getProfile,
    HttpClient,
} from "bungie-api-ts/destiny2"

const MAX_PAGE_PER_CHARACTER = 20

export async function getCharacterIds(cli: HttpClient, membershipType: BungieMembershipType, membershipId: string): Promise<string[]> {
    const profile = await getProfile(cli, {
        components: [DestinyComponentType.Characters],
        membershipType: membershipType,
        destinyMembershipId: membershipId,
    })

    const characters = profile.Response.characters.data
    if(characters !== undefined) {
        return Object.keys(characters)
    } else {
        return Promise.reject("invalid characters data")
    }
}

/**
 * Fetch all the activity histories for the given character of the membership.
 *
 * The histories that happened before the sentinel time will be discarded, and will stop the iteration.
 *
 * @param cli the http client
 * @param membershipType the membership type
 * @param membershipId the membership id
 * @param characterId the character id
 * @param sentinelTime the time used to filter the histories, see description above
 * @param countPerRequest the count per request
 */
export async function getCharacterActivityHistoryInTime(cli: HttpClient, membershipType: BungieMembershipType, membershipId: string, characterId: string, sentinelTime: Date, countPerRequest: number = 50): Promise<DestinyHistoricalStatsPeriodGroup[]> {
    let result: DestinyHistoricalStatsPeriodGroup[] = []
    for(let page = 1; ; page++) {
        console.log(`Fetching Activity Histories for ${membershipType}:${membershipId} #${characterId} page ${page}`)
        let resp = await getActivityHistory(cli, {
            characterId: characterId,
            membershipType: membershipType,
            destinyMembershipId: membershipId,
            count: countPerRequest,
        })

        // check success
        if(resp.ErrorCode !== 1) {
            console.error(resp)
            return Promise.reject(resp.Message)
        }

        const activities = resp.Response.activities
        const activities_filtered = activities.filter(act => {
            const thisTime = new Date(act.period)
            return thisTime.getTime() >= sentinelTime.getTime() // must be later than the sentinel time
        })
        result.push(...activities_filtered)
        console.log(`Grabbed ${activities_filtered.length} activities for ${membershipType}:${membershipId} #${characterId} page ${page}`)
        if(activities.length > activities_filtered.length) { // something has been filtered, time to break
            break
        }
        if(page > MAX_PAGE_PER_CHARACTER) { // don't make too many requests
            break
        }
    }
    return result
}

export async function getUserActivityHistoryInTime(cli: HttpClient, membershipType: BungieMembershipType, membershipId: string, sentinelTime: Date) {
    const characterIds = await getCharacterIds(cli, membershipType, membershipId)
    console.log(`Find characters for ${membershipType}:${membershipId}: [${characterIds.join(", ")}]`)
    const activityHistories = (await Promise.all(
        characterIds.map(
            (characterId) =>
                getCharacterActivityHistoryInTime(cli, membershipType, membershipId, characterId, sentinelTime),
        ))).flat()
    activityHistories.sort((a1, a2) => -(new Date(a1.period).getTime() - new Date(a2.period).getTime()))
    return activityHistories
}