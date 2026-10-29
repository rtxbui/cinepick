import { Link } from "react-router-dom";
import MovieCard from "../components/movie/MovieCard";
import EmptyState from "../components/ui/EmptyState";
import { CATALOG } from "../data/catalog";
import { useAuth } from "../context/AuthContext";

export default function Watchlist() {
  const { user } = useAuth();
  const movies = CATALOG.filter((m) => (user.watchlist || []).map(String).includes(String(m.id)));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-4xl">Watchlist</h1>
      {movies.length ? (
        <div className="mt-8 flex flex-wrap gap-4">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Your queue is empty"
            body="Save titles from Home or Discover and they’ll land here."
            action={
              <Link to="/discover" className="mt-4 inline-block text-gold">
                Browse Discover
              </Link>
            }
          />
        </div>
      )}
    </main>
  );
}
