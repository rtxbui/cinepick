import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import MovieRow from "../components/movie/MovieRow";
import EmptyState from "../components/ui/EmptyState";
import { CATALOG } from "../data/catalog";
import { useAuth } from "../context/AuthContext";
import { similarTo } from "../utils/recommend";
import { runtimeLabel } from "../utils/format";

export default function MovieDetails() {
  const { id } = useParams();
  const { toggle, user } = useAuth();
  const movie = CATALOG.find((m) => String(m.id) === String(id));
  if (!movie) return <EmptyState title="Movie missing" body="This title is not in the local catalog." />;
  const similar = similarTo(CATALOG, movie);
  const liked = (user.likedMovies || []).map(String).includes(String(movie.id));

  return (
    <main>
      <section className="relative min-h-[60vh] overflow-hidden">
        <img src={movie.backdrop || movie.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[220px_1fr]">
          <img src={movie.poster} alt={movie.title} className="w-56 rounded-2xl shadow-2xl" />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">{movie.genres.join(" · ")}</p>
            <h1 className="mt-2 font-display text-5xl">{movie.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-mist">
              <span className="inline-flex items-center gap-1 text-gold">
                <Star size={14} fill="currentColor" /> IMDb {movie.rating}
              </span>
              <span>RT {movie.rtScore}%</span>
              <span>{movie.year}</span>
              <span>{runtimeLabel(movie.runtime)}</span>
              <span>{movie.language}</span>
            </div>
            <p className="mt-5 max-w-2xl text-white/80">{movie.overview}</p>
            <p className="mt-4 text-sm text-mist">Director · {movie.director}</p>
            <p className="text-sm text-mist">Cast · {movie.cast.join(", ")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
                href={`https://www.youtube.com/watch?v=${movie.trailer}`}
                target="_blank"
                rel="noreferrer"
              >
                Watch Trailer
              </a>
              <button onClick={() => toggle("watchlist", movie.id)} className="rounded-full border border-white/20 px-5 py-2 text-sm">
                Watchlist
              </button>
              <button onClick={() => toggle("likedMovies", movie.id)} className="rounded-full border border-white/20 px-5 py-2 text-sm">
                {liked ? "Liked" : "Like"}
              </button>
              <button onClick={() => toggle("watchHistory", movie.id)} className="rounded-full border border-white/20 px-5 py-2 text-sm">
                Mark watched
              </button>
            </div>
          </div>
        </div>
      </section>
      <MovieRow title="Because you liked this movie, you may also like..." movies={similar} />
    </main>
  );
}
