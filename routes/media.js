const router = require("express").Router();
const media = require("../controllers/media.controllers");

router.post("/media", media.createMedia);
router.get("/media", media.getAllMedia);
router.delete("/media/:id", media.deleteMedia);

module.exports = router;
