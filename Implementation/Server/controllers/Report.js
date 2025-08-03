const Post = require("../models/CreatePostModel");

const RepostAdd = async (req, res) => {
    const { postId } = req.body; // ✅ Ensure userId is used for reportedBy
    const userId = req.user.id;
    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        post.status = "reported";
        post.user = userId; // ✅ Fixed undefined reportedByclear
        await post.save();

        res.json({ success: true, message: "Post reported successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const GetRepost = async (req, res) => {
    try {
        // Fetch all posts that have been reported (including those that are now approved or declined)
        const reportedPosts = await Post.find({ 
            status: { $in: ["reported", "approved", "declined"] } 
        }).populate("user", "username email");
        
        res.json({ success: true, posts: reportedPosts });
    } catch (error) {
        console.error("Error fetching reported posts:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateRepost = async (req, res) => {
  const { postId, status } = req.body; // ✅ Ensure correct fields

  try {
      const post = await Post.findById(postId);
      if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" });
      }

      if (status === "decline") {
          // Update status to declined
          post.status = "declined";
          await post.save();
          return res.json({ success: true, message: "Post declined successfully" });
      } else if (status === "approve") {
          // Update status to approved
          post.status = "approved";
          await post.save();
          return res.json({ success: true, message: "Post approved successfully" });
      }
      
      res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
      console.error("Error updating post status:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { RepostAdd, GetRepost, updateRepost };
