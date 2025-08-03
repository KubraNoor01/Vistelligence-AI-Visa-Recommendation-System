const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer"); // Import updated multer config
const { createPost, getPosts, getUserPosts, deletePost, updatePostStatus } = require("../controllers/CreatPost");
const { middleWare } = require("../middlewares/AuthMiddleware");


// Ensure the field name matches frontend
router.post("/posts", middleWare, upload.single("image"), createPost);
router.get("/getposts", getPosts);
router.get("/myposts", middleWare, getUserPosts); // Protected route
router.delete("/deletePost/:postId", middleWare, deletePost); // Delete post route
router.put("/updateStatus/:postId", middleWare, updatePostStatus); // Update post status (admin only)


module.exports = router;
