# Activism

Activism, just a random name, is a CloudFlare worker, used to
fetch Destiny 2 Activity Histories for specific User (account-wise).

## `/v1/get-history/{membershipType}/{membershipId}`

The endpoint to get the activity histories happened in 7 days (default).

## Usage

Deploy with Wrangler on CloudFlare.

Remember to set the environments defined in `wrangler.toml`. For local development, you can copy `.dev.vars-template` to
`.dev.vars` and fill the values.