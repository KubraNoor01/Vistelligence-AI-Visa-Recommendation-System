const Like = require("../models/Likes");
const PostModel = require("../models/CreatePostModel");
const UserModel = require("../models/UserModel");
const { createNotification } = require("./Notification");

// Add Like (One Like per User)
const LikeAdd = async (req, res) => {
    const { PostId } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    try {
        // Check if user has already liked the post
        const existingLike = await Like.findOne({ UserId: userId, PostId });

        if (existingLike) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already liked this post." 
            });
        }

        // If not liked, add a new like
        const newLike = new Like({ UserId: userId, PostId, count: 1 });
        await newLike.save();

        // Get post details to find the post owner
        const post = await PostModel.findById(PostId);
        if (post) {
            // Get user details for notification message
            const user = await UserModel.findById(userId);
            const username = user ? user.username : 'Someone';
            
            // Create notification for post owner
            const message = `${username} liked your post "${post.name}"`;
            await createNotification(post.user, userId, PostId, 'like', message);
        }

        // Recalculate total likes
        const totalLikes = await Like.countDocuments({ PostId });

        res.status(200).json({ 
            success: true, 
            message: "Like added successfully", 
            totalLikes,
            isLiked: true 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add like", error: error.message });
    }
};

// Get Likes Count for a Post and Check If User Liked
const GetLikes = async (req, res) => {
    try {
        const { PostId } = req.query;
        if (!PostId) {
            return res.status(400).json({ success: false, message: "PostId is required" });
        }

        const userId = req.user?.id;

        const totalLikes = await Like.countDocuments({ PostId });

        const userLike = userId ? await Like.findOne({ UserId: userId, PostId }) : null;
        const isLiked = !!userLike;

        res.status(200).json({ success: true, PostId, totalLikes, isLiked });

    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch likes", error: err.message });
    }
};

// Delete Like
const Delete = async (req, res) => {
    const { PostId } = req.body;
    const userId = req.user.id;

    try {
        const like = await Like.findOne({ UserId: userId, PostId });

        if (!like) {
            return res.status(400).json({ success: false, message: "You have not liked this post yet." });
        }

        await Like.deleteOne({ UserId: userId, PostId });

        const totalLikes = await Like.countDocuments({ PostId });

        res.status(200).json({ success: true, message: "Like removed", totalLikes, isLiked: false });

    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to remove like", error: err.message });
    }
};

module.exports = { LikeAdd, GetLikes, Delete };
