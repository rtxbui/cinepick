import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/movie/MovieCard";
import EmptyState from "../components/ui/EmptyState";
import { filterLocal } from "../utils/api";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const movies = useMemo(() => filterLocal({ q }), [q]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-4xl">Search</h1>
      <input
        value={q}
        onChange={(e) => setParams({ q: e.target.value })}
        placeholder="Search any movie, actor, or director"
        className="glass mt-6 w-full rounded-2xl px-5 py-4 text-lg outline-none"
      />
      {!q ? (
        <p className="mt-8 text-mist">Try Interstellar, Nolan, or Zendaya.</p>
      ) : movies.length ? (
        <div className="mt-8 flex flex-wrap gap-4">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState title="No matches" body="Try another title, or browse Discover." />
        </div>
      )}
    </main>
  );
}
