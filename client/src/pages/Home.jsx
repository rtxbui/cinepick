import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import HeroBanner from "../components/movie/HeroBanner";
import MovieRow from "../components/movie/MovieRow";
import { CATALOG, HIDDEN_GEM_IDS, TOP_RATED_IDS, TRENDING_IDS } from "../data/catalog";
import { useAuth } from "../context/AuthContext";
import { becauseYouLiked, recommendForUser } from "../utils/recommend";

function byIds(ids) {
  return ids.map((id) => CATALOG.find((m) => m.id === id)).filter(Boolean);
}

export default function Home() {
  const { user, onboarded } = useAuth();
  const madeForYou = useMemo(() => recommendForUser(CATALOG, user, { limit: 14 }), [user]);
  const { seed, similar } = useMemo(() => becauseYouLiked(CATALOG, user), [user]);
  const watchlist = CATALOG.filter((m) => (user.watchlist || []).map(String).includes(String(m.id)));
  const hero = madeForYou[0] || CATALOG[0];

  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <main>
      <HeroBanner movie={hero} />
      <MovieRow title="Made For You" subtitle="AI taste match from your survey, likes, and ratings" movies={madeForYou} />
      <MovieRow title={`Because You Liked ${seed?.title || "Interstellar"}`} subtitle="Similarity across genre, mood, and story DNA" movies={similar} />
      <MovieRow title="Trending Movies" movies={byIds(TRENDING_IDS)} />
      <MovieRow title="Top Rated Movies" movies={byIds(TOP_RATED_IDS)} />
      <MovieRow title="Hidden Gems" subtitle="High craft, quieter fame" movies={byIds(HIDDEN_GEM_IDS)} />
      <MovieRow title="Your Watchlist" movies={watchlist} />
    </main>
  );
}
