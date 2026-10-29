import { useMemo } from "react";
import { CATALOG } from "../data/catalog";
import { filterLocal } from "../utils/api";

export function useCatalog(params) {
  return useMemo(() => filterLocal(params), [params]);
}

export function useMovie(id) {
  return CATALOG.find((m) => String(m.id) === String(id)) || null;
}
