const axios = require("axios");
const { CATALOG } = require("../data/catalog");

const KEY = process.env.TMDB_API_KEY;
const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 8000,
  params: { api_key: KEY },
});

function img(path, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

function mapTmdb(movie, extra = {}) {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    rating: movie.vote_average,
    rtScore: extra.rtScore || Math.round((movie.vote_average || 0) * 10),
    genres: extra.genres || (movie.genre_ids || []).map(String),
    language: extra.language || movie.original_language,
    runtime: extra.runtime || movie.runtime,
    director: extra.director || "",
    cast: extra.cast || [],
    overview: movie.overview,
    poster: img(movie.poster_path),
    backdrop: img(movie.backdrop_path, "original"),
    trailer: extra.trailer || "",
    moods: extra.moods || [],
    popularity: movie.popularity,
    keywords: extra.keywords || [],
  };
}

async function tmdbGet(path, params) {
  if (!KEY) return null;
  const { data } = await api.get(path, { params });
  return data;
}

async function searchOrDiscover(query) {
  if (!KEY) return CATALOG;
  try {
    if (query.q) {
      const data = await tmdbGet("/search/movie", { query: query.q });
      return (data.results || []).map(mapTmdb);
    }
    const data = await tmdbGet("/discover/movie", {
      sort_by: "popularity.desc",
      "vote_average.gte": query.minRating || undefined,
      with_original_language: query.languageCode || undefined,
      "primary_release_date.gte": query.yearMin ? `${query.yearMin}-01-01` : undefined,
      with_runtime_lte: query.runtimeMax || undefined,
    });
    return (data.results || []).map(mapTmdb);
  } catch (err) {
    console.error("TMDB fallback", err.message);
    return CATALOG;
  }
}

async function movieDetails(id) {
  const local = CATALOG.find((m) => String(m.id) === String(id));
  if (!KEY) return local || null;
  try {
    const data = await tmdbGet(`/movie/${id}`, { append_to_response: "credits,videos,keywords" });
    const director = data.credits?.crew?.find((c) => c.job === "Director")?.name;
    const trailer = data.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")?.key;
    return mapTmdb(data, {
      genres: (data.genres || []).map((g) => g.name),
      runtime: data.runtime,
      director,
      cast: (data.credits?.cast || []).slice(0, 6).map((c) => c.name),
      trailer,
      keywords: (data.keywords?.keywords || []).slice(0, 8).map((k) => k.name),
    });
  } catch {
    return local || null;
  }
}

module.exports = { searchOrDiscover, movieDetails, mapTmdb };
