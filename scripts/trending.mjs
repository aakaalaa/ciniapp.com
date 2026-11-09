// Homepage poster carousel: this week's trending titles that critics like.
//
//   node scripts/trending.mjs refresh   Pick 5 titles from TMDB's weekly trending list with a Rotten Tomatoes score of 70%+
//                                       (at least 2 TV shows) and write src/data/trending.json. Needs API keys.
//   node scripts/trending.mjs posters   Download the posters listed in trending.json into src/assets/trending/
//                                       (gitignored). No keys needed. Runs before every dev/build.
//
// The Monday GitHub Actions job runs `refresh` and commits trending.json, so the picks change once a week and every
// other build reuses them.
//
// Keys: TMDB_TOKEN and MDBLIST_KEY env vars (GitHub Actions secrets). Locally, when those are unset, the keys are read
// from Firestore `admin_keys/live_keys` (fields `tmdb`, `mdblist`), read-only, never printed.
// Rotten Tomatoes scores come from MDBList (`ratings[source=tomatoes]`), the same source the Cini pipeline uses.

import { createRequire } from "node:module";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "src/data/trending.json");
const POSTERS = path.join(ROOT, "src/assets/trending");

const COUNT = 5;
const MIN_TV = 2;
const MIN_RT = 70;
const MAX_PAGES = 5; // 20 titles a page
const POSTER_SIZE = "w780";

const LOCAL_SERVICE_ACCOUNT =
  "/Users/bimbola/Library/Mobile Documents/com~apple~CloudDocs/cini stuff/secrets/firebase-kini-x_service-account_cini-algo-runner.json";
const LOCAL_FIREBASE_ADMIN = "/Users/bimbola/kini-pw9mbt/custom_cloud_functions/node_modules/firebase-admin";

// ---------- keys ----------
async function loadKeys() {
  let tmdb = process.env.TMDB_TOKEN?.trim();
  let mdblist = process.env.MDBLIST_KEY?.trim();
  if (tmdb && mdblist) return { tmdb, mdblist };

  const sa = process.env.CINI_SERVICE_ACCOUNT || LOCAL_SERVICE_ACCOUNT;
  if (!existsSync(sa) || !existsSync(LOCAL_FIREBASE_ADMIN)) {
    throw new Error("Set TMDB_TOKEN and MDBLIST_KEY, or run this on the Mac that has the Cini service account.");
  }
  const require = createRequire(import.meta.url);
  const admin = require(LOCAL_FIREBASE_ADMIN);
  if (admin.apps.length === 0) {
    admin.initializeApp({ credential: admin.credential.cert(require(sa)), projectId: "kini-x" });
  }
  const snap = await admin.firestore().collection("admin_keys").doc("live_keys").get();
  const d = snap.exists ? snap.data() : {};
  await admin.app().delete();
  tmdb ||= String(d.tmdb || "").trim();
  mdblist ||= String(d.mdblist || "").trim();
  if (!tmdb || !mdblist) throw new Error("admin_keys/live_keys is missing tmdb or mdblist");
  return { tmdb, mdblist };
}

// ---------- APIs ----------
async function getJson(url, init, tries = 3) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
    if (res.ok) return res.json();
    if (i >= tries || (res.status < 500 && res.status !== 429)) {
      // The URL can carry an api key, so report the host and status only.
      throw new Error(`${new URL(url).host} answered ${res.status}`);
    }
    await new Promise((r) => setTimeout(r, 1500 * i));
  }
}

function tmdbClient(token) {
  // v4 read tokens are JWTs (three dot-separated parts); otherwise it's a v3 api key.
  const bearer = token.split(".").length === 3 && token.length > 100;
  return (p, params = {}) => {
    const u = new URL(`https://api.themoviedb.org/3${p}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    if (!bearer) u.searchParams.set("api_key", token);
    return getJson(u, bearer ? { headers: { Authorization: `Bearer ${token}` } } : {});
  };
}

async function rottenTomatoes(key, type, id) {
  const kind = type === "movie" ? "movie" : "show";
  const u = new URL(`https://api.mdblist.com/tmdb/${kind}/${id}`);
  u.searchParams.set("apikey", key);
  try {
    const d = await getJson(u);
    const rt = (d.ratings || []).find((r) => r.source === "tomatoes");
    return typeof rt?.value === "number" ? rt.value : null;
  } catch {
    return null; // not in MDBList yet: treat as unrated
  }
}

// ---------- refresh ----------
async function refresh() {
  const keys = await loadKeys();
  const tmdb = tmdbClient(keys.tmdb);
  const qualified = [];
  let checked = 0;

  const enough = () => qualified.length >= COUNT && qualified.filter((t) => t.type === "tv").length >= MIN_TV;

  for (let page = 1; page <= MAX_PAGES && !enough(); page++) {
    const { results = [] } = await tmdb("/trending/all/week", { page, language: "en-US" });
    for (const r of results) {
      if (enough()) break;
      if ((r.media_type !== "movie" && r.media_type !== "tv") || r.adult || !r.poster_path) continue;
      checked++;
      const rt = await rottenTomatoes(keys.mdblist, r.media_type, r.id);
      if (rt === null || rt < MIN_RT) continue;
      const date = r.release_date || r.first_air_date || "";
      qualified.push({
        id: r.id,
        type: r.media_type,
        title: r.title || r.name,
        year: date ? Number(date.slice(0, 4)) : null,
        rt,
        poster: r.poster_path,
      });
    }
  }

  // Top 5 in trending order, swapping the lowest-ranked movies for the next TV shows until there are at least 2.
  const pick = qualified.slice(0, COUNT);
  const spareTv = qualified.slice(COUNT).filter((t) => t.type === "tv");
  while (pick.filter((t) => t.type === "tv").length < MIN_TV && spareTv.length) {
    const lastMovie = pick.map((t) => t.type).lastIndexOf("movie");
    pick.splice(lastMovie, 1);
    pick.push(spareTv.shift());
  }
  pick.sort((a, b) => qualified.indexOf(a) - qualified.indexOf(b));

  const tv = pick.filter((t) => t.type === "tv").length;
  if (pick.length < COUNT || tv < MIN_TV) {
    throw new Error(`Only found ${pick.length} titles (${tv} TV) at ${MIN_RT}%+ in ${checked} trending titles; kept last week's picks.`);
  }

  const out = {
    updated: new Date().toISOString().slice(0, 10),
    source: "TMDB weekly trending, Rotten Tomatoes 70%+ via MDBList",
    titles: pick,
  };
  await mkdir(path.dirname(DATA), { recursive: true });
  await writeFile(DATA, JSON.stringify(out, null, 2) + "\n");
  for (const t of out.titles) console.log(`  ${t.type.padEnd(5)} ${String(t.rt).padStart(3)}%  ${t.title} (${t.year ?? "?"})`);
  console.log(`Wrote ${path.relative(ROOT, DATA)} (${checked} trending titles checked).`);
}

// ---------- posters ----------
export const posterFile = (t) => `${t.type}-${t.id}.jpg`;

async function posters() {
  if (!existsSync(DATA)) {
    console.log("No trending.json yet; skipping posters.");
    return;
  }
  const { titles } = JSON.parse(await readFile(DATA, "utf8"));
  await mkdir(POSTERS, { recursive: true });
  const want = new Set(titles.map(posterFile));
  for (const f of await readdir(POSTERS)) if (!want.has(f)) await rm(path.join(POSTERS, f));
  for (const t of titles) {
    const file = path.join(POSTERS, posterFile(t));
    if (existsSync(file)) continue;
    const res = await fetch(`https://image.tmdb.org/t/p/${POSTER_SIZE}${t.poster}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.warn(`  poster for ${t.title} failed (${res.status}); the card is skipped`);
      continue;
    }
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  console.log(`Posters ready in ${path.relative(ROOT, POSTERS)}.`);
}

const cmd = process.argv[2];
if (cmd === "refresh") await refresh();
else if (cmd === "posters") await posters();
else if (cmd === "all") {
  await refresh();
  await posters();
} else {
  console.error("Usage: node scripts/trending.mjs refresh|posters|all");
  process.exit(1);
}
