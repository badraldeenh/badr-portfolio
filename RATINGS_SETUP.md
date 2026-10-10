# Shared portfolio ratings

The public portfolio keeps its existing pages and styling. Each of its 12 videos and five brand projects sends ratings to `/api/ratings`. The owner dashboard is `/api/ratings-dashboard`, protected by HTTP Basic authentication. Username: `admin`.

## Activation

1. Reconnect Vercel using the account with access to team `badrmohmaed574-7361` and project `badr-eldin-portfolio` (`prj_qvfPjTFjlFgRIr7ivmwcoRZD3JoR`). The current connector cannot administer this scope: it returns HTTP 403.
2. Connect an Upstash Redis database through this project's Vercel Storage / Marketplace page. Use a free plan if one is offered; no paid plan or subscription is authorized by this change.
3. Confirm the integration provides `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Production and Preview. Do not place their values in Git or browser code.
4. Set `RATINGS_COOKIE_SECRET` to a cryptographically random value of at least 32 characters. Keep it unchanged after launch; rotating it invalidates anonymous voter cookies.
5. Set `RATINGS_ADMIN_PASSWORD` to a strong password of at least 16 characters. Enter it directly in Vercel's environment variables, not in chat or source code.
6. Deploy the prepared branch to Preview and verify: zero-rating dashboard, unauthorized dashboard access, one 5-star vote, changing it to 3 stars without increasing the count, a second browser voter, an idempotent retry, and authenticated CSV export.
7. Publish the verified version on the existing production project.

## Data and behavior

- Browser identity: signed, secure, HttpOnly first-party cookie with 180-day lifetime. The database receives a keyed hash, not an email, name or raw IP address.
- One active score per cookie and project. Clearing cookies or using another browser can produce another voter; this is not a count of distinct people.
- Anonymous writes are restricted to same-origin JSON submissions for the known project IDs and integer scores 1–5.
- Redis executes each vote and its aggregate updates atomically in one Lua script. Repeating the same score is idempotent. Changing a score adjusts the histogram and sum without incrementing the count.
- Mutation rate limit: 120 score changes per hashed address per 10 minutes. Rate-limit keys expire; raw addresses are not stored.
- Aggregate counts and averages are public beside the rating buttons. The owner dashboard and CSV export require the configured password and never expose individual voter hashes.
- Browser-only ratings from the previous implementation are not silently uploaded. Shared counts begin with submissions after activation.
- Empty data shows zero counts and no average; network or configuration failures never show fabricated ratings or a success message.
- Dashboard statistics do not disclose visitor identities or time on site.

## Checks

Run `node --test tests/ratings.test.js` and `node --check assets/js/project-ratings.js`. Tests cover cookie signatures and expiry, origin restrictions, rejected input, storage error behavior, aggregate parsing, weighted averages, dashboard authentication and CSV escaping. When Python and `liblua5.4` are available, `python tests/ratings-lua.test.py` exercises the actual Lua update script using Redis-command doubles, including 500 aggregate invariants. This does not verify hosted Redis concurrency. Live database and browser-flow verification still require the authenticated Vercel project and configured storage.
