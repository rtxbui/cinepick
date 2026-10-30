const User = require("../models/User");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    likedMovies: user.likedMovies,
    watchHistory: user.watchHistory,
    watchlist: user.watchlist,
        savedMovies: user.savedMovies,
    ratings: user.ratings || {},
  };
}

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.savePreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: req.body.preferences },
      { new: true }
    );
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/rate  { movieId, value }  value 1-5 sets a rating, 0 removes it
exports.rate = async (req, res, next) => {
  try {
    const value = Number(req.body.value);
    if (!Number.isInteger(value) || value < 0 || value > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 0 to 5" });
    }
    if (req.body.movieId === undefined || req.body.movieId === null) {
      return res.status(400).json({ message: "movieId is required" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const ratings = { ...(user.ratings || {}) };
    const id = String(req.body.movieId);
    if (value === 0) delete ratings[id];
    else ratings[id] = value;
    user.ratings = ratings;
    user.markModified("ratings");
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.toggleList = async (req, res, next) => {
  try {
    const list = req.params.list;
    const allowed = ["likedMovies", "watchHistory", "watchlist", "savedMovies"];
    if (!allowed.includes(list)) return res.status(400).json({ message: "Unknown list" });
    const user = await User.findById(req.user.id);
    const id = String(req.body.movieId);
    const has = user[list].map(String).includes(id);
    user[list] = has ? user[list].filter((x) => String(x) !== id) : [...user[list], id];
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
