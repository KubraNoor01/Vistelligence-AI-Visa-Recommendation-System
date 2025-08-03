const express = require("express");
const {RepostAdd,GetRepost,updateRepost} = require("../controllers/Report");
const {middleWare} = require("../middlewares/AuthMiddleware")

const router = express.Router();

router.post("/report",middleWare, RepostAdd)
router.get("/reported", GetRepost)
router.put("/updateStatus", middleWare, updateRepost);

module.exports = router;
