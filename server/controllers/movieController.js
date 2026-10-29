const { CATALOG } = require("../data/catalog");
const { applyFilters, similarTo } = require("../services/recommend");
const { movieDetails, searchOrDiscover } = require("../services/tmdb");

exports.list = async (req, res, next) => {
  try {
    const remote = await searchOrDiscover(req.query);
    const movies = applyFilters(remote.length ? remote : CATALOG, req.query);
    res.json({ movies });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const movie = await movieDetails(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ movie });
  } catch (err) {
    next(err);
  }
};

exports.similar = async (req, res, next) => {
  try {
    const seed = CATALOG.find((m) => String(m.id) === String(req.params.id));
    res.json({ movies: similarTo(CATALOG, seed) });
  } catch (err) {
    next(err);
  }
};
