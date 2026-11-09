import compression from "compression";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 3000);

// Gzip responses (htmx.min.js goes from ~51 KB to ~17 KB over the wire).
app.use(compression());

// Parse classic HTML form bodies (htmx sends forms as application/x-www-form-urlencoded).
app.use(express.urlencoded({ extended: false }));

// Static assets, including the vendored htmx build at /vendor/htmx.min.js.
app.use(express.static(path.join(__dirname, "public")));

// A fragment endpoint: htmx fetches this and swaps the HTML into the page.
app.get("/fragment", (_req, res) => {
  const now = new Date().toISOString();
  res.send(/* html */ `
    <div class="card">
      <strong>Fragment rendered on the server</strong>
      <p>Server time: <code>${now}</code></p>
    </div>
  `);
});

// A form endpoint: htmx POSTs the form and swaps the response in place.
app.post("/greet", (req, res) => {
  const name = String(req.body.name ?? "").trim();
  if (!name) {
    // htmx's default response handling only swaps 2xx responses, so a 422
    // fragment would never be displayed (https://htmx.org/docs/#response-handling).
    // Keep the status 200 and let the markup carry the error state — or keep a
    // 4xx status and opt htmx in to swapping it via the htmx-config meta tag.
    res.send(`<p class="error">Please tell me your name.</p>`);
    return;
  }
  const safe = name.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  res.send(`<p class="ok">Hello, <strong>${safe}</strong> — rendered by Express, swapped by htmx.</p>`);
});

// Health check for the container platform.
app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, HOST, () => {
  console.log(`htmx starter listening on http://${HOST}:${PORT}`);
});
