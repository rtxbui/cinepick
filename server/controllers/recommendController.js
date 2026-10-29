const { CATALOG } = require("../data/catalog");
const User = require("../models/User");
const { recommendForUser } = require("../services/recommend");

exports.forMe = async (req, res, next) => {
  try {
    let profile = {
      preferences: { genres: ["Sci-Fi", "Thriller"], moods: ["Mind-bending"] },
      likedMovies: [157336, 27205],
    };
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user) profile = user;
    }
    res.json({ movies: recommendForUser(CATALOG, profile) });
  } catch (err) {
    next(err);
  }
};
