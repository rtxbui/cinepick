const router = require("express").Router();
const { list, detail, similar } = require("../controllers/movieController");

router.get("/", list);
router.get("/:id", detail);
router.get("/:id/similar", similar);

module.exports = router;
