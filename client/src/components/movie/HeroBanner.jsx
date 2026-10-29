import { motion } from "framer-motion";
import { Play, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HeroBanner({ movie }) {
  const { toggle } = useAuth();
  if (!movie) return null;

  return (
    <section className="relative h-[78vh] min-h-[540px] overflow-hidden">
      <motion.img
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8 }}
        src={movie.backdrop || movie.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="hero-mask absolute inset-0" />
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Featured tonight</p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-mist">
            <span className="inline-flex items-center gap-1 text-gold">
              <Star size={14} fill="currentColor" /> {movie.rating}
            </span>
            <span>{movie.year}</span>
            <span>{movie.genres?.slice(0, 3).join(" · ")}</span>
            <span>RT {movie.rtScore}%</span>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-white/75 md:text-base">{movie.overview}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailer}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
            >
              <Play size={16} fill="currentColor" /> Watch Trailer
            </a>
            <button
              type="button"
              onClick={() => toggle("watchlist", movie.id)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm backdrop-blur"
            >
              <Plus size={16} /> Add To Watchlist
            </button>
            <Link to={`/movie/${movie.id}`} className="inline-flex items-center rounded-full px-4 py-2.5 text-sm text-mist">
              Details
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
