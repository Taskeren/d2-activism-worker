# Activism

Activism, just a random name, is a CloudFlare worker, used to
fetch Destiny 2 Activity Histories for specific User (account-wise).

### `/v1/get-history/{membershipType}/{membershipId}`

The endpoint to get the activity histories happened in 7 days (default).

### `/v1/get-activity-definitions/[language]`

The endpoint to get the activity definitions.

## Usage

Deploy with Wrangler on CloudFlare. Remember to set the secret of Bungie API key `BUNGIE_API_KEY`.