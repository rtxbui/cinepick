import { Link } from "react-router-dom";
import MovieCard from "../components/movie/MovieCard";
import { CATALOG } from "../data/catalog";
import { useAuth } from "../context/AuthContext";
import { recommendForUser, tasteSummary } from "../utils/recommend";

function Shelf({ title, ids }) {
  const movies = CATALOG.filter((m) => (ids || []).map(String).includes(String(m.id)));
  if (!movies.length) return <p className="text-sm text-mist">Nothing here yet.</p>;
  return (
    <div className="flex flex-wrap gap-4">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} compact />
      ))}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const recs = recommendForUser(CATALOG, user, { limit: 8 });
  const genres = user.preferences?.genres || [];

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <header className="glass flex flex-wrap items-end justify-between gap-4 rounded-3xl p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Taste profile</p>
          <h1 className="mt-2 font-display text-5xl">{user.name}</h1>
          <p className="mt-3 max-w-xl text-mist">{tasteSummary(user)}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/onboarding" className="rounded-full border border-white/15 px-4 py-2 text-sm">
            Retake survey
          </Link>
          <Link to="/compare" className="rounded-full border border-white/15 px-4 py-2 text-sm">
            Compare films
          </Link>
          <Link to="/login" className="rounded-full bg-white px-4 py-2 text-sm text-black">
            Account
          </Link>
          <button onClick={logout} className="text-sm text-mist">
            Sign out
          </button>
        </div>
      </header>
      <section>
        <h2 className="mb-3 font-display text-2xl">Favorite genres</h2>
        <div className="flex flex-wrap gap-2">
          {genres.length ? genres.map((g) => (
            <span key={g} className="rounded-full bg-white/8 px-4 py-2 text-sm">
              {g}
            </span>
          )) : <span className="text-mist">Finish onboarding to lock this in.</span>}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Recommended for you</h2>
        <div className="flex flex-wrap gap-4">
          {recs.map((m) => (
            <MovieCard key={m.id} movie={m} compact />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Liked movies</h2>
        <Shelf ids={user.likedMovies} />
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Watch history</h2>
        <Shelf ids={user.watchHistory} />
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Saved / watchlist</h2>
        <Shelf ids={user.watchlist} />
      </section>
    </main>
  );
}
