const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { me, savePreferences, rate, toggleList } = require("../controllers/userController");

router.get("/me", auth, me);
router.put("/preferences", auth, savePreferences);
router.post("/rate", auth, rate); // keep above "/:list", otherwise "rate" is read as a list name
router.post("/:list", auth, toggleList);

module.exports = router;