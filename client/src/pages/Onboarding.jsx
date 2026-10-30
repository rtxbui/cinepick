import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Poster from "../components/ui/Poster";
import { CATALOG, GENRES, LANGUAGES, MOODS } from "../data/catalog";
import { useAuth } from "../context/AuthContext";

const ACTORS = ["Leonardo DiCaprio", "Timothée Chalamet", "Scarlett Johansson", "Cillian Murphy", "Zendaya", "Song Kang-ho"];
const DIRECTORS = ["Christopher Nolan", "Denis Villeneuve", "Greta Gerwig", "Bong Joon-ho", "Hayao Miyazaki", "Damien Chazelle"];

function Chip({ selected, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        selected ? "border-crimson bg-crimson text-white" : "border-white/15 bg-white/5 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}

export default function Onboarding() {
  const { savePreferences, updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    genres: user?.preferences?.genres || [],
    moods: user?.preferences?.moods || [],
    language: user?.preferences?.language || "English",
    duration: user?.preferences?.duration || "any",
    minRating: user?.preferences?.minRating || 7,
    people: user?.preferences?.people || [],
    liked: user?.likedMovies || [],
  });

  const toggle = (key, value) => {
    setForm((prev) => {
      const set = new Set(prev[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [key]: [...set] };
    });
  };

  const steps = [
    {
      title: "What worlds do you live in?",
      body: "Pick the genres that already feel like you.",
      node: (
        <div className="flex flex-wrap justify-center gap-2">
          {GENRES.map((g) => (
            <Chip key={g} selected={form.genres.includes(g)} onClick={() => toggle("genres", g)}>
              {g}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Mood first, plot later.",
      body: "How should a great night in feel?",
      node: (
        <div className="flex flex-wrap justify-center gap-2">
          {MOODS.map((g) => (
            <Chip key={g} selected={form.moods.includes(g)} onClick={() => toggle("moods", g)}>
              {g}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Language, length, and standards.",
      body: "We’ll use this to keep recommendations sharp.",
      node: (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES.map((g) => (
              <Chip key={g} selected={form.language === g} onClick={() => setForm((p) => ({ ...p, language: g }))}>
                {g}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              ["any", "Any length"],
              ["short", "Under 2h"],
              ["medium", "Around 2h"],
              ["long", "Epic"],
            ].map(([id, label]) => (
              <Chip key={id} selected={form.duration === id} onClick={() => setForm((p) => ({ ...p, duration: id }))}>
                {label}
              </Chip>
            ))}
          </div>
          <label className="block text-center text-sm text-mist">
            Minimum IMDb {form.minRating}+
            <input
              type="range"
              min="5"
              max="9"
              step="0.5"
              value={form.minRating}
              onChange={(e) => setForm((p) => ({ ...p, minRating: Number(e.target.value) }))}
              className="mt-3 w-full accent-crimson"
            />
          </label>
        </div>
      ),
    },
    {
      title: "Faces you trust.",
      body: "Actors and directors you already follow.",
      node: (
        <div className="flex flex-wrap justify-center gap-2">
          {[...ACTORS, ...DIRECTORS].map((g) => (
            <Chip key={g} selected={form.people.includes(g)} onClick={() => toggle("people", g)}>
              {g}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Tap films you already loved.",
      body: "This is how CinePick learns similarity.",
      node: (
        <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto md:grid-cols-5">
          {CATALOG.slice(0, 20).map((m) => {
            const on = form.liked.map(String).includes(String(m.id));
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle("liked", m.id)}
                className={`overflow-hidden rounded-xl border ${on ? "border-gold" : "border-transparent opacity-70"}`}
              >
          <Poster src={m.poster} alt={m.title} title={m.title} size="w342" className="aspect-[2/3] w-full object-cover" />
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  const finish = async () => {
    updateUser({ likedMovies: form.liked });
    await savePreferences({
      genres: form.genres,
      moods: form.moods,
      language: form.language,
      duration: form.duration,
      minRating: form.minRating,
      people: form.people,
    });
    navigate("/");
  };

  const current = steps[step];

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-crimson/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">CinePick taste survey</p>
        <div className="mx-auto mt-4 h-1 max-w-md overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-crimson" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="glass mt-10 rounded-[32px] px-6 py-10"
          >
            <h1 className="font-display text-4xl md:text-5xl">{current.title}</h1>
            <p className="mx-auto mt-3 max-w-md text-mist">{current.body}</p>
            <div className="mt-8">{current.node}</div>
            <div className="mt-10 flex justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-mist disabled:opacity-30"
              >
                Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black"
                >
                  Continue
                </button>
              ) : (
                <button type="button" onClick={finish} className="rounded-full bg-crimson px-6 py-2 text-sm font-medium">
                  Build my profile
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
