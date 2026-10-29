const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "cinepick-dev-secret");
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "cinepick-dev-secret");
    } catch {
      req.user = null;
    }
  }
  next();
}

module.exports = { auth, optionalAuth };
