import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

const KEY = "cinepick_profile";
const AuthContext = createContext(null);

const emptyProfile = {
  name: "Guest",
  email: "",
  preferences: null,
  likedMovies: [157336, 27205],
  watchHistory: [],
  watchlist: [],
  savedMovies: [],
};

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || emptyProfile;
  } catch {
    return emptyProfile;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readLocal);
  const [token, setToken] = useState(localStorage.getItem("cinepick_token"));

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!token) return;
    api
      .me()
      .then(({ data }) => setUser((prev) => ({ ...prev, ...data.user })))
      .catch(() => {});
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      onboarded: Boolean(user?.preferences?.completed),
      updateUser: (patch) => setUser((prev) => ({ ...prev, ...patch })),
      savePreferences: async (preferences) => {
        const next = { ...user, preferences: { ...preferences, completed: true } };
        setUser(next);
        try {
          await api.savePreferences(next.preferences);
        } catch {
          /* demo mode */
        }
      },
      toggle: (list, movieId) => {
        setUser((prev) => {
          const current = new Set((prev[list] || []).map(String));
          const id = String(movieId);
          if (current.has(id)) current.delete(id);
          else current.add(id);
          return { ...prev, [list]: [...current].map((x) => Number(x) || x) };
        });
        api.toggleList(list, movieId).catch(() => {});
      },
      login: async (email, password) => {
        const { data } = await api.login({ email, password });
        localStorage.setItem("cinepick_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      register: async (payload) => {
        const { data } = await api.register(payload);
        localStorage.setItem("cinepick_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      logout: () => {
        localStorage.removeItem("cinepick_token");
        setToken(null);
        setUser(emptyProfile);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
