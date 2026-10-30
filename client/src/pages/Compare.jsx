import { useMemo, useState } from "react";
import { CATALOG } from "../data/catalog";
import { overlap } from "../utils/recommend";

export default function Compare() {
  const [a, setA] = useState("157336");
  const [b, setB] = useState("27205");
  const left = CATALOG.find((m) => String(m.id) === a);
  const right = CATALOG.find((m) => String(m.id) === b);
  const shared = useMemo(() => (left && right ? overlap(left.genres, right.genres) : 0), [left, right]);

  const select = (setter) => (
    <select value={setter === setA ? a : b} onChange={(e) => setter(e.target.value)} className="w-full rounded-xl bg-black/40 p-2">
      {CATALOG.map((m) => (
        <option key={m.id} value={m.id}>
          {m.title}
        </option>
      ))}
    </select>
  );

  const card = (movie) =>
    movie ? (
      <article className="glass rounded-3xl p-5">
        <Poster
          src={movie.poster}
          alt={movie.title}
          title={movie.title}
          size="w500"
          className="mx-auto h-72 w-48 rounded-2xl object-cover"
        />
        <h2 className="mt-4 font-display text-3xl">{movie.title}</h2>
        <p className="text-sm text-mist">
          {movie.year} · {movie.rating} IMDb · {movie.director}
        </p>
        <p className="mt-3 text-sm text-white/80">{movie.overview}</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-gold">{movie.genres.join(" · ")}</p>
      </article>
    ) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-4xl">Movie comparison</h1>
      <p className="mt-2 text-mist">
        {left && right
          ? `${left.title} and ${right.title} share ${shared} genre${shared === 1 ? "" : "s"}.`
          : "Pick two films."}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {select(setA)}
        {select(setB)}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {card(left)}
        {card(right)}
      </div>
    </main>
  );
}
