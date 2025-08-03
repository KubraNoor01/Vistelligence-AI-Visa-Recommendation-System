const express = require("express");
const { LikeAdd, GetLikes, Delete } = require("../controllers/Likes");
const { middleWare } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// All endpoints here require a valid token
router.post("/AddLike", middleWare, LikeAdd);
router.get("/GetLikes",  GetLikes);
router.delete("/DeleteLikes", middleWare, Delete);

module.exports = router;
