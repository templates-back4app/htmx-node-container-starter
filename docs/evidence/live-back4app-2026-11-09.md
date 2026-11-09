# Live deploy — Back4app Containers — 2026-11-09

App: spoke-htmx (free plan), created fresh from back4app-templates/container-deploy-lab @ rotation (commit 665c397 = this repo @ a84294b + stamp d7cc2b08-c01e-41f5-9a22-321374cbb19d). Port 8080 at creation. The container runs the Express server itself — no nginx stage.

## Public URL (client São Paulo; CloudFront edge; fresh deploy)
- Live at 13:44:42 UTC.
- GET /fragment: 200 — HTML fragment endpoint serving live.
- POST /greet (urlencoded form): 200 — the htmx form round trip works on the public URL (express.urlencoded in place).
- Vendored /vendor/htmx.min.js: 16,897 B gzip transferred (compression() enabled in this repo; express.static alone would serve ~51 KB raw).
- TTFB on / (3 requests, illustrative): 0.967 / 0.968 / 0.975 s.

Local measurements: docs/evidence/local-measurements-2026-11-06.md
