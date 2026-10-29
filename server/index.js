require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/recommend", require("./routes/recommend"));
app.use("/api/chat", require("./routes/chat"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
    } else {
      console.log("MongoDB skipped — set MONGODB_URI to enable auth persistence");
    }
  } catch (err) {
    console.log("MongoDB unavailable, continuing with movie APIs only:", err.message);
  }
  app.listen(PORT, () => console.log(`CinePick API on http://localhost:${PORT}`));
}

start();
