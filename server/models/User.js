const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    preferences: {
      genres: [String],
      moods: [String],
      language: String,
      duration: String,
      minRating: Number,
      people: [String],
      completed: Boolean,
    },
    likedMovies: { type: [String], default: [] },
    watchHistory: { type: [String], default: [] },
    watchlist: { type: [String], default: [] },
    savedMovies: { type: [String], default: [] },
        searchHistory: { type: [String], default: [] },
    ratings: { type: Object, default: {} }, // { "<movieId>": 1-5 }
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model("User", userSchema);
