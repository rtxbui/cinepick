export const imgFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect fill="#16161f" width="100%" height="100%"/><text x="50%" y="50%" fill="#8a8a9a" text-anchor="middle" font-family="sans-serif" font-size="22">CinePick</text></svg>`
  );

export function runtimeLabel(mins) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function stars(rating) {
  return Number(rating || 0).toFixed(1);
}
/** Direct trailer link, or a YouTube search when the catalog has no trailer id. */
export function trailerUrl(movie) {
  if (movie.trailer) return `https://www.youtube.com/watch?v=${movie.trailer}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.year || ""} trailer`)}`;
}