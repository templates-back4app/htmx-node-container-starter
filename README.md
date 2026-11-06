# HTMX + Node Container Starter

A hand-written reference implementation: Express 5 serves one HTML page, and htmx (pinned to **2.0.11**, vendored locally at `public/vendor/htmx.min.js` — no CDN) swaps in server-rendered HTML: a `GET /fragment` endpoint and a `POST /greet` form. No build step, no client framework — the whole app is `server.js` + `public/index.html`.

The server honors `HOST` and `PORT` env vars (defaults 0.0.0.0:3000; the Dockerfile sets 8080) and exposes `/healthz`.

Run locally with Docker:

```sh
docker build -t htmx-starter .
docker run -p 8080:8080 htmx-starter
# open http://localhost:8080
```

Deploy guide: see the Back4app blog post for deploying this repo on Back4app Containers (placeholder — link coming with the tutorial).

Measurements for this exact commit are in `docs/evidence/local-measurements-2026-11-06.md`.
