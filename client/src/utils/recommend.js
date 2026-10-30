/**
 * Content-based recommendation engine.
 * Scores movies from survey answers, liked titles, ratings, and similar metadata.
 * Structured so a later ML ranker can replace `scoreMovie`.
 * (server/services/recommend.js mirrors this file — keep the two in sync.)
 */
export function overlap(a = [], b = []) {
  const set = new Set(a.map((x) => String(x).toLowerCase()));
  return b.filter((x) => set.has(String(x).toLowerCase())).length;
}

/** How alike two movies are: genres, moods, keywords, director, cast. */
export function affinity(movie, other) {
  let score = overlap(movie.genres, other.genres) * 2.8;
  score += overlap(movie.moods, other.moods || []) * 2.2;
  score += overlap(movie.keywords || [], other.keywords || []) * 3.5;
  if (movie.director && movie.director === other.director) score += 3;
  if (overlap(movie.cast, other.cast)) score += 1.4;
  return score;
}

/** Ids the user already reacted to; they should not come back as "new" picks. */
export function seenIds(profile) {
  return new Set(
    [...(profile?.likedMovies || []), ...(profile?.watchHistory || []), ...Object.keys(profile?.ratings || {})].map(String)
  );
}

/**
 * Movies the user's taste is built from, each with a weight from -1 (disliked) to +1 (loved).
 * A like counts as +1. A star rating overrides it: 5 -> +1, 4 -> +0.5, 3 -> 0, 2 -> -0.5, 1 -> -1.
 */
export function tasteSeeds(catalog, profile) {
  const weights = new Map();
  (profile?.likedMovies || []).forEach((id) => weights.set(String(id), 1));
  Object.entries(profile?.ratings || {}).forEach(([id, stars]) => weights.set(String(id), (Number(stars) - 3) / 2));
  return [...weights]
    .filter(([, weight]) => weight !== 0)
    .map(([id, weight]) => ({ movie: catalog.find((m) => String(m.id) === id), weight }))
    .filter((seed) => seed.movie);
}

export function scoreMovie(movie, profile, seedMovie, seeds = []) {
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

export function recommendForUser(catalog, profile, { limit = 12, excludeIds = [], excludeSeen = true } = {}) {
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

export function similarTo(catalog, seed, { limit = 8 } = {}) {
  if (!seed) return [];
  return [...catalog]
    .filter((m) => m.id !== seed.id)
    .map((movie) => ({ movie, score: scoreMovie(movie, { preferences: {} }, seed) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.movie);
}

export function becauseYouLiked(catalog, profile) {
  // Highest-rated movie first (4+ stars), then the liked list
  const ratings = profile?.ratings || {};
  const topRated = Object.keys(ratings)
    .filter((id) => ratings[id] >= 4)
    .sort((a, b) => ratings[b] - ratings[a]);
  const candidates = [...topRated, ...(profile?.likedMovies || [])].map(String);

  let seed = null;
  for (const id of candidates) {
    seed = catalog.find((m) => String(m.id) === id);
    if (seed) break;
  }
  seed = seed || catalog.find((m) => m.title === "Interstellar");
  return { seed, similar: similarTo(catalog, seed) };
}

export function tasteSummary(profile) {
  const genres = profile?.preferences?.genres || [];
  const moods = profile?.preferences?.moods || [];
  if (!genres.length && !moods.length) {
    return "Curious explorer — still learning your taste.";
  }
  const g = genres.slice(0, 2).join(" & ") || "cinema";
  const m = moods[0] ? `${moods[0].toLowerCase()} ` : "";
  return `You gravitate toward ${m}${g} with layered storytelling.`;
}

export function chatSuggest(catalog, message, profile) {
  const text = (message || "").toLowerCase();
  const seed = catalog.find((m) => text.includes(m.title.toLowerCase()));
  const moodBoost = ["emotional", "dark", "feel-good", "mind-bending", "intense", "whimsical"].find((m) =>
    text.includes(m)
  );
  const genreBoost = catalog
    .flatMap((m) => m.genres)
    .find((g) => text.includes(g.toLowerCase()));

  const fakeProfile = {
    preferences: {
      ...(profile?.preferences || {}),
      moods: moodBoost
        ? [moodBoost[0].toUpperCase() + moodBoost.slice(1)]
        : profile?.preferences?.moods,
      genres: genreBoost ? [genreBoost] : profile?.preferences?.genres,
    },
    likedMovies: seed ? [seed.id] : profile?.likedMovies,
    watchHistory: profile?.watchHistory,
    ratings: profile?.ratings,
  };

  const picks = recommendForUser(catalog, fakeProfile, {
    limit: 5,
    excludeIds: seed ? [seed.id] : [],
  });

  let reply = "Here are a few titles that match that vibe.";
  if (seed && moodBoost) {
    reply = `If you loved ${seed.title} but want something more ${moodBoost}, start here.`;
  } else if (seed) {
    reply = `Because you mentioned ${seed.title}, these sit in a similar neighborhood.`;
  } else if (genreBoost) {
    reply = `Strong ${genreBoost} picks based on your taste profile.`;
  }
  return { reply, movies: picks };
}