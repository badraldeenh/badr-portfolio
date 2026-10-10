# Visitor analytics

Existing portfolio design and ratings remain intact. The production `/` route continues to use `home-v4.html`. No dependencies are needed: the Vercel Node function uses native fetch and crypto.

## Activate

In the **badr-eldin-portfolio** Vercel project, connect an Upstash Redis database through Storage/Marketplace. Add these encrypted production variables:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (existing `KV_REST_API_URL` / `KV_REST_API_TOKEN` aliases also work).
- `ANALYTICS_ADMIN_PASSWORD`: a unique random password of at least 16 characters. Do not put it in GitHub or client code.

Redeploy the main commit after configuring the variables. Open `/analytics.html`, sign in and test with `/?ref=sienna` in a separate browser. Allow detailed analytics, open a project, leave the tab visible for 20 seconds, hide it for 20 seconds, return, and click CV. Refresh the dashboard; only visible time should accrue. Verify signed-out requests to `?action=sessions` return 401. Anonymous requests may collect only, never read records.

If setup is missing, `/api/visitor-analytics?action=status` reports `enabled:false`, the dashboard explicitly shows setup required, and duration collection stays disabled. Synthetic duration pageviews are no longer injected into Web Analytics, so actual pageview counts are not inflated. The new central dashboard contains no historical analytics imported from Vercel.

## Measurements

- Consent is required for the new detailed tracker; DNT and GPC disable it. The existing basic Vercel analytics stays separate.
- New documents start a fresh session after 30 minutes without an update, or when a different explicit company label is used. A random consented browser ID connects repeat visits, not real-world identities.
- Each document has a separate ID. Atomic Redis high-water updates merge retries and out-of-order beacons without double counting. Page visibility time and the dominant visible project's duration are sampled every second; updates send every 15 seconds and on visibility/page lifecycle changes. Displayed seconds are rounded, and missing beacons can cause undercounting.
- A hidden tab contributes elapsed page time but not visible time. Video duration means playback while visible, including autoplay, not proof of attention. Simultaneously visible documents can sum above wall-clock session duration.
- Last update is not an exact departure time or proof the person is still online. No retrospective timing is possible.
- Company `ref` or `utm_campaign` labels persist through internal navigation, including project links opened in a new tab.
- Country/city come from trusted Vercel geo headers; no raw IP is stored in visit records. Rate limits use a one-minute HMAC of the IP. Bots detected from UA are ignored; telemetry is inherently client supplied.
- Records expire after 90 days. The dashboard shows at most the latest 500 sessions in the selected range and says when that limit is reached; its aggregates and repeat counts apply only to loaded records.
- Admin authentication uses a signed 12-hour HttpOnly Secure SameSite cookie, password checking on the server, no browser-stored password and a login rate limit. Changing the password invalidates existing admin cookies.

## Local checks

`node --test tests/visitor-analytics.test.cjs` validates collection requests, authentication, hostile origins, time sanitization, missing setup and rate limits using a mocked Redis transport. `node --test tests/visit-tracker.test.cjs` checks visibility timing, attribution, consent and lifecycle behavior using simulated browser events. These checks do not replace an end-to-end test against the hosted database after configuration.

References: https://upstash.com/docs/redis/features/restapi and https://upstash.com/docs/redis/commands/eval

Ratings currently remain browser-local, with canonical project identifiers shared across listing and case-study pages. They are not central vote totals. Central rating storage still requires a provisioned database and an API.
