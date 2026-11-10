# Follow-up test through the Back4app MCP — htmx-node-container-starter — 2026-11-10 (14:34–14:37 UTC)

Same context as `mcp-back4app-2026-11-10.md`. Starter commit `c2271fd` (the one that fixed `POST /greet` without a body). Upload links carry a one-time token and are not recorded.

## Deploy with no port given (app `mcp-htmx-noport`)

- `create_upload` → CLI: 12 files, 100 KB, 5 s wall time.
- `create_web_app` with `name`, `uploadId`, `manifestSha256` only: no `port`, builder not specified → `DOCKERFILE`.
- appId `b20cba60-eaeb-420f-bd32-fe35faf60f06`, deploymentId `7ac4e21d-bf24-476c-ace0-2a2be46cd5b3`. Created 14:34:44.638Z → READY 14:35:32.796Z: **48.2 s**. URL https://mcphtmxnoport-4t7uvbu7.back4.app
- `get_deployment` carried `suggestions: { port: 8080 }` while building. After READY, `get_web_app` showed `port: null`.
- The same day, the React starter (nginx image) created without a port FAILED at launch with `Please mention a port in settings to expose.` (see `mcp-followup-2026-11-10.md` in react-container-starter). The difference was not isolated.

## Functional check in a browser

`browser-checks-2026-11-10/verify.mjs` (Playwright driving Chrome), output in `htmx-noport.json`: 6 of 6 passed.

- `/` renders `<h1>HTMX + Node starter</h1>`.
- Clicking "Fetch server fragment" swaps a card into `#fragment-slot`; the server time in it differed between two clicks (`14:36:42.065Z`, then `14:36:43.733Z`), so the content is produced per request.
- Typing `Ada` and submitting the form swaps `Hello, Ada — rendered by Express, swapped by htmx.` into `#greet-result`.
- Submitting the form empty swaps `Please tell me your name.`.
