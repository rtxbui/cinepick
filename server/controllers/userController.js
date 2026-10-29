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
