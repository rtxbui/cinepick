# CinePick

Personalized movie recommendations with a Netflix + Spotify-style interface. Built as a full-stack college AI project: taste survey, content-based ranking, TMDB-ready movie data, and JWT auth.

## Stack

- **Client:** React, Vite, Tailwind CSS, Framer Motion
- **Server:** Node.js, Express
- **Database:** MongoDB
- **Auth:** JWT
- **Movies:** TMDB API (optional) plus a curated fallback catalog

## Run locally

```bash
cd CinePick
npm install
cd client && npm install
cd ../server && npm install
cd ..
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:5000

The UI works without MongoDB or TMDB. Preferences, likes, and watchlist save in the browser. Copy `server/.env.example` to `server/.env` and add:

- `MONGODB_URI` for accounts
- `TMDB_API_KEY` from [themoviedb.org](https://www.themoviedb.org/settings/api) for live search/posters

## Recommendation logic

`server/services/recommend.js` scores titles from:

- Survey genres, moods, language, duration, rating floor
- Liked movies (genre, mood, keyword, director overlap)
- Popularity as a light tie-breaker

The same scoring function is used for “Made For You”, “Because You Liked…”, Discover filters, and the assistant chat. Swap `scoreMovie` later for a trained ranker without changing the UI.
