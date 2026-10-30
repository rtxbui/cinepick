// Mirrors client/src/utils/recommend.js — keep the scoring in sync.
function overlap(a = [], b = []) {
  const set = new Set(a.map((x) => String(x).toLowerCase()));
  return b.filter((x) => set.has(String(x).toLowerCase())).length;
}

/** How alike two movies are: genres, moods, keywords, director, cast. */
function affinity(movie, other) {
  let score = overlap(movie.genres, other.genres) * 2.8;
  score += overlap(movie.moods, other.moods || []) * 2.2;
  score += overlap(movie.keywords || [], other.keywords || []) * 3.5;
  if (movie.director && movie.director === other.director) score += 3;
  if (overlap(movie.cast, other.cast)) score += 1.4;
  return score;
}

/** Ids the user already reacted to; they should not come back as "new" picks. */
function seenIds(profile) {
  return new Set(
    [...(profile?.likedMovies || []), ...(profile?.watchHistory || []), ...Object.keys(profile?.ratings || {})].map(String)
  );
}

/**
 * Movies the user's taste is built from, each with a weight from -1 (disliked) to +1 (loved).
 * A like counts as +1. A star rating overrides it: 5 -> +1, 4 -> +0.5, 3 -> 0, 2 -> -0.5, 1 -> -1.
 */
function tasteSeeds(catalog, profile) {
  const weights = new Map();
  (profile?.likedMovies || []).forEach((id) => weights.set(String(id), 1));
  Object.entries(profile?.ratings || {}).forEach(([id, stars]) => weights.set(String(id), (Number(stars) - 3) / 2));
  return [...weights]
    .filter(([, weight]) => weight !== 0)
    .map(([id, weight]) => ({ movie: catalog.find((m) => String(m.id) === id), weight }))
    .filter((seed) => seed.movie);
}

function scoreMovie(movie, profile, seedMovie, seeds = []) {
  const prefs = profile?.preferences || {};
  let score = 0;
  score += overlap(movie.genres, prefs.genres || []) * 3.2;
  score += overlap(movie.moods, prefs.moods || []) * 2.4;
  if (prefs.language && movie.language === prefs.language) score += 1.6;

  // Favourite actors / directors picked in the onboarding survey
  score += overlap([movie.director, ...(movie.cast || [])], prefs.people || []) * 2.6;

  const duration = prefs.duration || "any";
  if (duration === "short" && movie.runtime <= 110) score += 1.1;
  if (duration === "medium" && movie.runtime > 110 && movie.runtime <= 140) score += 1.1;
  if (duration === "long" && movie.runtime > 140) score += 1.1;
  const minRating = Number(prefs.minRating || 0);
  if (movie.rating >= minRating) score += 1.2 + (movie.rating - minRating) * 0.15;

  // "More like this one" (movie details page)
  if (seedMovie) score += affinity(movie, seedMovie);

  // Pulled towards what the user liked / rated high, pushed away from what they rated low
  if (seeds.length) {
    const pull = seeds.reduce((sum, seed) => sum + seed.weight * affinity(movie, seed.movie), 0);
    score += (pull / Math.sqrt(seeds.length)) * 0.6;
  }

  score += (movie.popularity || 0) / 40;
  return score;
}

function recommendForUser(catalog, profile, { limit = 12, excludeIds = [], excludeSeen = true } = {}) {
  const exclude = new Set(excludeIds.map(String));
  if (excludeSeen) seenIds(profile).forEach((id) => exclude.add(id));
  const seeds = tasteSeeds(catalog, profile);
  return [...catalog]
    .filter((m) => !exclude.has(String(m.id)))
    .map((movie) => ({ movie, score: scoreMovie(movie, profile, undefined, seeds) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.movie);
}

function similarTo(catalog, seed, { limit = 8 } = {}) {
  if (!seed) return [];
  return [...catalog]
    .filter((m) => m.id !== seed.id)
    .map((movie) => ({ movie, score: scoreMovie(movie, { preferences: {} }, seed) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.movie);
}

function chatSuggest(catalog, message, profile) {
  const text = (message || "").toLowerCase();
  const seed = catalog.find((m) => text.includes(m.title.toLowerCase()));
  const moods = ["Feel-good", "Dark", "Emotional", "Mind-bending", "Intense", "Whimsical"];
  const moodBoost = moods.find((m) => text.includes(m.toLowerCase()));
  const genreBoost = catalog.flatMap((m) => m.genres).find((g) => text.includes(g.toLowerCase()));
  const fakeProfile = {
    preferences: {
      ...(profile?.preferences || {}),
      moods: moodBoost ? [moodBoost] : profile?.preferences?.moods,
      genres: genreBoost ? [genreBoost] : profile?.preferences?.genres,
    },
    likedMovies: seed ? [seed.id] : profile?.likedMovies,
    watchHistory: profile?.watchHistory,
    ratings: profile?.ratings,
  };
  const movies = recommendForUser(catalog, fakeProfile, { limit: 5, excludeIds: seed ? [seed.id] : [] });
  let reply = "Here are a few titles that match that vibe.";
  if (seed && moodBoost) reply = `If you loved ${seed.title} but want something more ${moodBoost.toLowerCase()}, start here.`;
  else if (seed) reply = `Because you mentioned ${seed.title}, these sit in a similar neighborhood.`;
  return { reply, movies };
}

function applyFilters(movies, query = {}) {
  return movies.filter((m) => {
    if (query.q && !`${m.title} ${m.director} ${m.cast.join(" ")}`.toLowerCase().includes(String(query.q).toLowerCase())) return false;
    if (query.genre && !m.genres.includes(query.genre)) return false;
    if (query.language && m.language !== query.language) return false;
    if (query.minRating && m.rating < Number(query.minRating)) return false;
    if (query.minRt && m.rtScore < Number(query.minRt)) return false;
    if (query.yearMin && m.year < Number(query.yearMin)) return false;
    if (query.yearMax && m.year > Number(query.yearMax)) return false;
    if (query.runtimeMax && m.runtime > Number(query.runtimeMax)) return false;
    if (query.popularity && m.popularity < Number(query.popularity)) return false;
    return true;
  });
}

module.exports = { scoreMovie, recommendForUser, similarTo, chatSuggest, applyFilters };