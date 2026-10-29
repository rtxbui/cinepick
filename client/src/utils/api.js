import axios from "axios";
import { CATALOG } from "../data/catalog";
import { chatSuggest, recommendForUser, similarTo } from "./recommend";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 8000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinepick_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function tryApi(fn, fallback) {
  try {
    const { data } = await fn();
    return data;
  } catch {
    return fallback();
  }
}

export const api = {
  register: (payload) => client.post("/auth/register", payload),
  login: (payload) => client.post("/auth/login", payload),
  me: () => client.get("/users/me"),
  savePreferences: (preferences) => client.put("/users/preferences", { preferences }),
  toggleList: (list, movieId) => client.post(`/users/${list}`, { movieId }),
  movies: (params) =>
    tryApi(
      () => client.get("/movies", { params }),
      () => ({ movies: filterLocal(params) })
    ),
  movie: (id) =>
    tryApi(
      () => client.get(`/movies/${id}`),
      () => ({ movie: CATALOG.find((m) => String(m.id) === String(id)) || null })
    ),
  similar: (id) =>
    tryApi(
      () => client.get(`/movies/${id}/similar`),
      () => {
        const seed = CATALOG.find((m) => String(m.id) === String(id));
        return { movies: similarTo(CATALOG, seed) };
      }
    ),
  recommendations: (profile) =>
    tryApi(
      () => client.get("/recommend"),
      () => ({ movies: recommendForUser(CATALOG, profile) })
    ),
  chat: (message, profile) =>
    tryApi(
      () => client.post("/chat", { message }),
      () => chatSuggest(CATALOG, message, profile)
    ),
};

export function filterLocal(params = {}) {
  return CATALOG.filter((m) => {
    if (params.q && !`${m.title} ${m.director} ${m.cast.join(" ")}`.toLowerCase().includes(params.q.toLowerCase())) {
      return false;
    }
    if (params.genre && !m.genres.includes(params.genre)) return false;
    if (params.language && m.language !== params.language) return false;
    if (params.minRating && m.rating < Number(params.minRating)) return false;
    if (params.minRt && m.rtScore < Number(params.minRt)) return false;
    if (params.yearMin && m.year < Number(params.yearMin)) return false;
    if (params.yearMax && m.year > Number(params.yearMax)) return false;
    if (params.runtimeMax && m.runtime > Number(params.runtimeMax)) return false;
    if (params.popularity && m.popularity < Number(params.popularity)) return false;
    return true;
  });
}
