/**
 * Content-based recommendation engine.
 * Scores movies from survey answers, liked titles, and similar metadata.
 * Structured so a later ML ranker can replace `scoreMovie`.
 */
export function overlap(a = [], b = []) {
  const set = new Set(a.map((x) => String(x).toLowerCase()));
  return b.filter((x) => set.has(String(x).toLowerCase())).length;
}

export function scoreMovie(movie, profile, seedMovie) {
  const prefs = profile?.preferences || {};
  let score = 0;

  score += overlap(movie.genres, prefs.genres || []) * 3.2;
  score += overlap(movie.moods, prefs.moods || []) * 2.4;
  if (prefs.language && movie.language === prefs.language) score += 1.6;

  const duration = prefs.duration || "any";
  if (duration === "short" && movie.runtime <= 110) score += 1.1;
  if (duration === "medium" && movie.runtime > 110 && movie.runtime <= 140) score += 1.1;
  if (duration === "long" && movie.runtime > 140) score += 1.1;

  const minRating = Number(prefs.minRating || 0);
  if (movie.rating >= minRating) score += 1.2 + (movie.rating - minRating) * 0.15;

  const liked = new Set((profile?.likedMovies || []).map(String));
  if (liked.has(String(movie.id))) score += 8;

  if (seedMovie) {
    score += overlap(movie.genres, seedMovie.genres) * 2.8;
    score += overlap(movie.moods, seedMovie.moods || []) * 2.2;
    score += overlap(movie.keywords || [], seedMovie.keywords || []) * 3.5;
    if (movie.director === seedMovie.director) score += 3;
    if (overlap(movie.cast, seedMovie.cast)) score += 1.4;
  }

  score += (movie.popularity || 0) / 40;
  return score;
}

export function recommendForUser(catalog, profile, { limit = 12, excludeIds = [] } = {}) {
  const exclude = new Set(excludeIds.map(String));
  return [...catalog]
    .filter((m) => !exclude.has(String(m.id)))
    .map((movie) => ({ movie, score: scoreMovie(movie, profile) }))
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
  const likedId = profile?.likedMovies?.[0];
  const seed = catalog.find((m) => String(m.id) === String(likedId)) || catalog.find((m) => m.title === "Interstellar");
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
