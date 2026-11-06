# Local measurements — 2026-11-06

Machine: Apple M5, macOS 26.5.2. Docker: colima VM (docker 29.5.2, linux/aarch64, 4 CPUs, 8 GB) — Docker Desktop was not installed on the work machine, so the docker CLI + colima were installed via Homebrew.
Node v22.23.4 / npm 10.9.9 (host; images use `node:22-alpine`).

Packages: express@5.3.0, compression@1.8.2, htmx.org@2.0.11 (devDependency, used only to vendor `dist/htmx.min.js` into `public/vendor/`).

| Metric | Value | Command |
|---|---|---|
| npm ci | 0.3 s | `rm -rf node_modules && time npm ci` |
| npm run build | n/a — no build step | — |
| App size | 56 KB (`public/`, incl. vendored htmx) + `server.js` | `du -sh public` |
| docker build (no cache) | 5.4 s | `time docker build --no-cache -t htmx-node-container-starter .` |
| Image size | 240 MB | `docker images --format '{{.Size}}'` |
| First-load JS (gzip) | 16,897 B (~16.5 KB) — just `/vendor/htmx.min.js` | see method below |

First-load JS method: `docker run -p 8091:8080 …`, `curl http://localhost:8091/`, collect every `.js` URL referenced from the page, then curl each with `Accept-Encoding: gzip` and sum `size_download`. htmx.min.js 2.0.11 is 52,182 B raw and 16,897 B gzipped; the only script on the page.

Notes / pitfalls:
- `express.static` does **not** compress: without `app.use(compression())` htmx ships as 51 KB instead of 16.5 KB over the wire. Compression is enabled in `server.js`.
- htmx is vendored by installing `htmx.org@2.0.11` as an exact-pinned devDependency and copying `node_modules/htmx.org/dist/htmx.min.js` to `public/vendor/` (committed), so the page never hotlinks a CDN.
- htmx posts forms as `application/x-www-form-urlencoded` — Express needs `express.urlencoded()` (JSON middleware won't see the fields).
- Express binds all interfaces by default; `HOST`/`PORT` env vars are honored and the image sets `PORT=8080`.
