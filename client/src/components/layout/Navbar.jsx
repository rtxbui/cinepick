import { Film, Search, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/search", label: "Search" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-crimson shadow-[0_0_24px_rgba(229,9,20,0.45)]">
            <Film size={18} />
          </span>
          <span className="text-lg">
            Cine<span className="text-gold">Pick</span>
          </span>
        </NavLink>
        <nav className="hidden items-center gap-5 text-sm text-mist md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive ? "text-white" : "transition hover:text-white"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <form
          className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 md:max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search size={16} className="text-mist" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies, directors, actors"
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
          />
        </form>
        <NavLink
          to="/profile"
          className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm md:flex"
        >
          <UserRound size={16} />
          {user?.name || "Guest"}
        </NavLink>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-3 text-sm text-mist md:hidden">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "text-white" : "")}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
