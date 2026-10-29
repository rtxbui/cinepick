import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, subtitle, movies = [] }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          {subtitle ? <p className="text-sm text-mist">{subtitle}</p> : null}
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => scroll(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={ref} className="hide-scroll flex gap-4 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
