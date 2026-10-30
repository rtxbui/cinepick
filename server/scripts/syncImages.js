/**
 * Re-fetches the real poster/backdrop path of every movie from TMDB and rewrites
 * both catalogs (server/data/catalog.js and client/src/data/catalog.js).
 *
 * Run from the server folder:   npm run sync:images
 * Needs TMDB_API_KEY in server/.env (a v3 API key, or a v4 read-access token).
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const KEY = process.env.TMDB_API_KEY;
const BASE = process.env.TMDB_API_BASE || "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const FILES = [
  path.join(__dirname, "..", "data", "catalog.js"),
  path.join(__dirname, "..", "..", "client", "src", "data", "catalog.js"),
];

async function tmdb(pathname) {
  const url = new URL(BASE + pathname);
  const isToken = KEY.length > 40; // v4 read-access tokens are long JWTs
  if (!isToken) url.searchParams.set("api_key", KEY);
  const res = await fetch(url, { headers: isToken ? { Authorization: `Bearer ${KEY}` } : {} });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function setField(block, field, value) {
  return block.replace(new RegExp(`${field}: "[^"]*"`), `${field}: "${value}"`);
}

// Replaces poster/backdrop inside the catalog entry that has `id: <id>,`
function patch(text, id, poster, backdrop) {
  const start = text.search(new RegExp(`^\\s+id: ${id},`, "m"));
  if (start === -1) return text;
  let end = text.indexOf("\n  },", start);
  if (end === -1) end = text.length;
  let block = text.slice(start, end);
  if (poster) block = setField(block, "poster", poster);
  if (backdrop) block = setField(block, "backdrop", backdrop);
  return text.slice(0, start) + block + text.slice(end);
}

async function main() {
  if (!KEY) {
    console.error("Add TMDB_API_KEY to server/.env first.");
    process.exit(1);
  }
  const texts = FILES.map((file) => fs.readFileSync(file, "utf8"));
  const ids = [...texts[0].matchAll(/^\s+id: (\d+),/gm)].map((m) => m[1]);
  const failed = [];

  for (const id of ids) {
    try {
      const data = await tmdb(`/movie/${id}`);
      if (!data.poster_path) throw new Error("TMDB has no poster for this id");
      const poster = `${IMG}/w500${data.poster_path}`;
      const backdrop = data.backdrop_path ? `${IMG}/w1280${data.backdrop_path}` : null;
      texts.forEach((_, i) => {
        texts[i] = patch(texts[i], id, poster, backdrop);
      });
      console.log(`ok    ${id}  ${data.title}`); // eyeball: title should match the catalog entry
    } catch (err) {
      failed.push(id);
      console.log(`FAIL  ${id}  ${err.message}`);
    }
  }

  FILES.forEach((file, i) => fs.writeFileSync(file, texts[i]));
  console.log(`\n${ids.length - failed.length}/${ids.length} updated${failed.length ? `, failed: ${failed.join(", ")}` : ""}`);
}

main();