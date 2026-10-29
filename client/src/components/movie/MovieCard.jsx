import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { imgFallback, stars } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

export default function MovieCard({ movie, compact = false }) {
  const { toggle, user } = useAuth();
  if (!movie) return null;
  const saved = (user?.watchlist || []).map(String).includes(String(movie.id));

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-2xl bg-panel ${compact ? "w-36 md:w-40" : "w-40 md:w-48"} shrink-0`}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            onError={(e) => {
              e.currentTarget.src = imgFallback;
            }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-gold">
            <Star size={11} fill="currentColor" />
            {stars(movie.rating)}
          </span>
          <div className="absolute inset-x-0 bottom-0 translate-y-4 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-3 text-[11px] leading-relaxed text-white/80">{movie.overview}</p>
          </div>
        </div>
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-1 text-sm font-medium">{movie.title}</h3>
          <p className="text-[11px] text-mist">
            {movie.year} · {movie.genres?.[0]}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle("watchlist", movie.id)}
        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/50 text-white ${saved ? "text-gold" : ""}`}
        aria-label="Add to watchlist"
      >
        <Plus size={16} />
      </button>
    </motion.article>
  );
}
