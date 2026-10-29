import { useMemo, useState } from "react";
import MovieCard from "../components/movie/MovieCard";
import { GENRES, LANGUAGES } from "../data/catalog";
import { filterLocal } from "../utils/api";

export default function Discover() {
  const [filters, setFilters] = useState({
    genre: "",
    language: "",
    minRating: 0,
    minRt: 0,
    yearMin: 1970,
    runtimeMax: 210,
    popularity: 0,
  });

  const movies = useMemo(() => filterLocal(filters), [filters]);
  const set = (key) => (e) => setFilters((p) => ({ ...p, [key]: e.target.value }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-4xl">Discover</h1>
      <p className="mt-2 text-mist">Combine filters like “Sci-Fi after 2015 with IMDb above 8”.</p>
      <div className="glass mt-6 grid gap-4 rounded-3xl p-5 md:grid-cols-4">
        <label className="text-xs text-mist">
          Genre
          <select value={filters.genre} onChange={set("genre")} className="mt-1 w-full rounded-xl bg-black/40 p-2 text-sm">
            <option value="">All</option>
            {GENRES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-mist">
          Language
          <select value={filters.language} onChange={set("language")} className="mt-1 w-full rounded-xl bg-black/40 p-2 text-sm">
            <option value="">All</option>
            {LANGUAGES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-mist">
          IMDb min ({filters.minRating || 0})
          <input type="range" min="0" max="9" step="0.5" value={filters.minRating} onChange={set("minRating")} className="mt-3 w-full accent-gold" />
        </label>
        <label className="text-xs text-mist">
          Rotten Tomatoes min ({filters.minRt || 0}%)
          <input type="range" min="0" max="99" step="1" value={filters.minRt} onChange={set("minRt")} className="mt-3 w-full accent-crimson" />
        </label>
        <label className="text-xs text-mist">
          Released after
          <input type="number" value={filters.yearMin} onChange={set("yearMin")} className="mt-1 w-full rounded-xl bg-black/40 p-2 text-sm" />
        </label>
        <label className="text-xs text-mist">
          Max duration (min)
          <input type="number" value={filters.runtimeMax} onChange={set("runtimeMax")} className="mt-1 w-full rounded-xl bg-black/40 p-2 text-sm" />
        </label>
        <label className="text-xs text-mist">
          Popularity floor
          <input type="range" min="0" max="95" value={filters.popularity} onChange={set("popularity")} className="mt-3 w-full" />
        </label>
      </div>
      <p className="mt-6 text-sm text-mist">{movies.length} titles</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </main>
  );
}
