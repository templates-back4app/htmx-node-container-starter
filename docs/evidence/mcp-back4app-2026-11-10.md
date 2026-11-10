# Deploy through the Back4app MCP — htmx-node-container-starter — 2026-11-10

Repo commit uploaded: `a098d26` (branch `main`, clean tree).

## Context (same for the 9 starters measured this day)

- Date: 2026-11-10 (all times UTC).
- Account kind: permanent, signed in (`whoami` -> `accountKind: "permanent"`, `limits: {freeAppsUsed: 19, maxFreeApps: 50}` before this run). Apps created on the Free plan.
- Client: Claude Code driving the Back4app MCP connector; terminal on macOS (Node v25.8.1, curl 8.7.1); validation requests left from Sao Paulo (CloudFront POP `GRU1-P5`).
- Upload CLI: `@back4app/cli` 0.3.2, run as `npx -y @back4app/cli upload --url <upload-link>` inside the starter folder. The upload link carries a one-time token and is not recorded here. `create_upload` returned `expiresAt` 15 minutes after the call.
- "create -> READY" below = deployment `createdAt` to the `updatedAt` of the `get_deployment` answer that first said `READY`. It is the platform's own clock, not the wall time of the polling.

## Tools called, in order

Part A: `create_upload` (no appId) -> CLI upload in the folder -> `create_web_app` -> `get_web_app` -> `get_deployment` -> `get_runtime_logs`

Part B2: `create_upload` (no appId) -> CLI upload in the folder -> `create_web_app` (`builder: "BUILDPACK"`) -> `get_web_app` -> `get_deployment` -> `get_web_app` -> `get_build_logs`

## Part A — Dockerfile (builder not specified)

### Upload (CLI output)

```text
Packing .../htmx-node-container-starter ...
11 file(s), 93 KB (2 left out)
Sending 11 new file(s) ...
Upload ready.
uploadId: 4f03ed79-eb68-488d-9335-c5c40300a4d8
manifestSha256: 2f06c47e491d1f42ba2cc25c08e02b1f075e32ce32e3baf84b57ae1441ba3f18
```

Wall time: 9 s. 11 files packed = the 11 tracked files (this folder has no build output). No "may hold secrets" message.

### App and deployment

- `create_web_app` arguments: `name: "mcp-htmx"`, `port: 8080`, `uploadId`, `manifestSha256`; `builder` not specified.
- appId `a78a8967-8d84-42b6-8019-2ff9b4cfec53` · deploymentId `bd62ea80-2ebf-4d80-a175-f5598c11ed9f`
- App `createdAt` 12:50:57.420Z · deployment `createdAt` 12:50:57.657Z
- Status seen: `BUILDING` / `FETCHING_CODE` (12:50:57) -> `READY` (`updatedAt` 12:51:31.771Z) -> **34.1 s**
- Public URL: 404 at 12:51:06, first 200 at 12:51:33.

Settings reported by `get_web_app`:

- `builder`: `DOCKERFILE` · `port`: `8080` · `startCommand`: `null` · `healthCheckPath`: `"/"` · `isStaticSite`: `false` · `rootDir`: `""` · `runtimeVersion`: `null` · `envVarNames`: `[]` · `plan`: `Free` · `source.kind`: `UPLOAD`
- `url`: https://mcphtmx-gzjym9dc.back4.app
- `urlExpiresAt`: 2026-11-10T13:50:57.594Z (60 minutes after the app was created)
- `get_deployment` returned no `suggestions` and no `portDetected` on this deployment.

### Validation on the public URL (12:51Z)

- `GET /` -> 200, `content-type: text/html; charset=utf-8`, `content-encoding: gzip`, `via: 1.1 ... .cloudfront.net (CloudFront)`, `x-powered-by: Express`, no `server` header. 1,427 B identity, 745 B transferred. `<h1>`: `HTMX + Node starter`.
- JS: `/vendor/htmx.min.js` -> 200, 16,897 B transferred with gzip (1 file). Headers: `content-encoding: gzip`, `cache-control: public, max-age=0`, `via: ... (CloudFront)`.
- `GET /nope-404` -> 404.
- `GET /fragment` -> 200 `text/html; charset=utf-8`:

```html
    <div class="card">
      <strong>Fragment rendered on the server</strong>
      <p>Server time: <code>2026-11-10T12:51:53.449Z</code></p>
    </div>
```

- `POST /greet` with `-d 'name=Lab'` -> 200:

```html
<p class="ok">Hello, <strong>Lab</strong> — rendered by Express, swapped by htmx.</p>
```

- `POST /greet` with `-d 'name='` -> 200 (the starter answers the validation message with 200 so htmx swaps it):

```html
<p class="error">Please tell me your name.</p>
```

- Extra, not asked for: `POST /greet` with no body and no content type -> **500** `Internal Server Error`. The runtime log shows why: `TypeError: Cannot read properties of undefined (reading 'name')` at `server.js:34:32` (Express 5 leaves `req.body` undefined when no body parser matched). A browser form never sends that request; a bare `curl -X POST` does. The starter was not changed.

### Runtime logs

`get_runtime_logs`: 12 lines. The first is the startup line; the other 11 are the stack trace of the body-less POST above.

```text
htmx starter listening on http://0.0.0.0:8080
```

## Part B2 — Buildpack on a server app

Same commit, same folder, uploaded again:

```text
11 file(s), 93 KB (2 left out)
Back4App already had every file: nothing to send.
Upload ready.
uploadId: feda80d6-3cf2-46db-93b3-68f032ab37ba
manifestSha256: 2f06c47e491d1f42ba2cc25c08e02b1f075e32ce32e3baf84b57ae1441ba3f18
```

Wall time 5 s; same `manifestSha256` as Part A, new `uploadId`.

- `create_web_app` arguments: `name: "mcp-htmx-buildpack"`, `builder: "BUILDPACK"`, `uploadId`, `manifestSha256`. No `port`, no `startCommand`.
- The answer of `create_web_app` itself carried the detection:

```json
"suggestions": { "startCommand": "node server.js", "port": 8080 }
```

  with this `nextAction`: "The analysis of the code suggests settings the app does not have. For each name in missingEnvVars, ask the person for the value (never invent one) and set it with update_web_app. Apply startCommand or port with update_web_app only if the deployment failed or the app does not answer."
- appId `f9e45e69-ba25-4048-9fb6-94762933cb83` · deploymentId `a62b070b-1a21-43d4-8cab-9aa444882f97`
- App `createdAt` 12:59:53.373Z · deployment `createdAt` 12:59:53.512Z -> `READY` (`updatedAt` 13:00:49.127Z) -> **55.6 s** (Dockerfile path on the same code: 34.1 s). Public URL: first 200 at 13:00:51.
- `get_deployment` at READY: no `suggestions`, no `portDetected`.
- `get_web_app`, before and after READY: `builder: "BUILDPACK"`, `port: null`, `startCommand: null`, `healthCheckPath: "/"`, `isStaticSite: false`, `runtimeVersion: null`. The suggested values were not written into the settings; the app ran on defaults.
- `url`: https://mcphtmxbuildpack-ztwz8xfx.back4.app · `urlExpiresAt`: 2026-11-10T13:59:53.449Z
- Build log, decisive lines:

```text
- No build scripts found
- Adding default web process for `npm start`
LAUNCHING CONTAINER...
Using port 8080 (from the default)
trying to hit the 8080 port using http
DEPLOYMENT READY
```

  It worked because `package.json` has a `start` script and `server.js` reads `PORT`.
- The three htmx checks on the buildpack app (13:01Z): `GET /fragment` -> 200 with the card and a fresh server time; `POST /greet` `name=Lab` -> 200 `<p class="ok">Hello, <strong>Lab</strong> — rendered by Express, swapped by htmx.</p>`; `POST /greet` `name=` -> 200 `<p class="error">Please tell me your name.</p>`. `GET /` 200 gzip 745 B; `/vendor/htmx.min.js` 200 gzip 16,897 B: identical to the Dockerfile app.

## Not tested

- Buildpack with a `port` other than 8080, or an app that ignores `PORT`; applying the `suggestions` with `update_web_app` (needs the owner's confirmation).
- Which Node version the buildpack picked (`runtimeVersion` stayed `null`; `engines.node` is `>=22`).
- Not tested anywhere in this series: `update_web_app` with a confirmationId, `rollback_web_app`, `confirm_action`, custom domains, env vars at creation, GitHub as the code source through MCP, behaviour after `urlExpiresAt`, a temporary (not signed in) account, the `files` upload path for clients with no terminal.
