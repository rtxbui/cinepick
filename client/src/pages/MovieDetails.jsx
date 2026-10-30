import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import MovieRow from "../components/movie/MovieRow";
import EmptyState from "../components/ui/EmptyState";
import Poster from "../components/ui/Poster";
import { CATALOG } from "../data/catalog";
import { useAuth } from "../context/AuthContext";
import { similarTo } from "../utils/recommend";
import { runtimeLabel, trailerUrl } from "../utils/format";

export default function MovieDetails() {
  const { id } = useParams();
  const { toggle, rate, user } = useAuth();
  const movie = CATALOG.find((m) => String(m.id) === String(id));
  if (!movie) return <EmptyState title="Movie missing" body="This title is not in the local catalog." />;
  const similar = similarTo(CATALOG, movie);
  const liked = (user.likedMovies || []).map(String).includes(String(movie.id));
  const mine = Number(user.ratings?.[movie.id] || 0);

  return (
    <main>
      <section className="relative min-h-[60vh] overflow-hidden">
        <Poster
          src={movie.backdrop}
          fallbackSrc={movie.poster}
          size="w1280"
          eager
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[220px_1fr]">
          <Poster
            src={movie.poster}
            alt={movie.title}
            title={movie.title}
            size="w500"
            eager
            className="w-56 rounded-2xl shadow-2xl"
          />
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
            <div className="mt-5 flex items-center gap-1" role="group" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => rate(movie.id, mine === n ? 0 : n)}
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  aria-pressed={n <= mine}
                >
                  <Star size={22} className={n <= mine ? "text-gold" : "text-white/25"} fill={n <= mine ? "currentColor" : "none"} />
                </button>
              ))}
              <span className="ml-2 text-xs text-mist">{mine ? `You rated ${mine}/5` : "Rate this movie"}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
                href={trailerUrl(movie)}
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