const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    tmdbId: Number,
    title: String,
    genre: [String],
    rating: Number,
    description: String,
    poster: String,
    cast: [String],
    director: String,
    releaseDate: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
