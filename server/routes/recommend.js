const router = require("express").Router();
const { optionalAuth } = require("../middleware/auth");
const { forMe } = require("../controllers/recommendController");

router.get("/", optionalAuth, forMe);

module.exports = router;
