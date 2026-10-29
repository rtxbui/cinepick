import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Auth from "./pages/Auth";
import Compare from "./pages/Compare";
import Discover from "./pages/Discover";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
