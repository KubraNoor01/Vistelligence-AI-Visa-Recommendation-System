const express = require("express");
const {AddComment, GetComment, GetCommentCount} = require("../controllers/Comment")
const { middleWare } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// All endpoints here require a valid token
router.post("/AddComment", middleWare, AddComment);
router.get("/GetComment", GetComment);
router.get("/count", GetCommentCount);

module.exports = router;
