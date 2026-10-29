const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { me, savePreferences, toggleList } = require("../controllers/userController");

router.get("/me", auth, me);
router.put("/preferences", auth, savePreferences);
router.post("/:list", auth, toggleList);

module.exports = router;
