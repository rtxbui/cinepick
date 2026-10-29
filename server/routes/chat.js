const router = require("express").Router();
const { optionalAuth } = require("../middleware/auth");
const { chat } = require("../controllers/chatController");

router.post("/", optionalAuth, chat);

module.exports = router;
