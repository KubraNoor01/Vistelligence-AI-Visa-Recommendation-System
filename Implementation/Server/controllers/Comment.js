const CommentModel = require("../models/Comment");
const PostModel = require("../models/CreatePostModel");
const UserModel = require("../models/UserModel");
const { createNotification } = require("./Notification");

const AddComment = async (req, res) => {
    const { PostId, comment } = req.body;
    const userId = req.user.id; // Extract userId from authenticated user

    try {
        const newComment = new CommentModel({ PostId, userId, comment });
        await newComment.save();
        
        // Populate username for response
        await newComment.populate('userId', 'username');

        // Get post details to find the post owner
        const post = await PostModel.findById(PostId);
        if (post) {
            // Get user details for notification message
            const user = await UserModel.findById(userId);
            const username = user ? user.username : 'Someone';
            
            // Create notification for post owner
            const message = `${username} commented on your post "${post.name}"`;
            await createNotification(post.user, userId, PostId, 'comment', message);
        }

        res.status(201).json({ success: true, message: "Comment added", comment: newComment });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to add comment", error: err.message });
    }
};

const GetComment = async (req, res) => {
    const { PostId } = req.query;

    if (!PostId) {
        return res.status(400).json({ success: false, message: "PostId is required" });
    }

    try {
        const comments = await CommentModel.find({ PostId })
            .populate('userId', 'username') // Fetch username along with comment
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, comments });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch comments", error: err.message });
    }
};

const GetCommentCount = async (req, res) => {
    const { postId } = req.query;

    if (!postId) {
        return res.status(400).json({ success: false, message: "postId is required" });
    }

    try {
        const totalComments = await CommentModel.countDocuments({ PostId: postId });
        res.status(200).json({ success: true, totalComments });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch comment count", error: err.message });
    }
};

module.exports = { AddComment, GetComment, GetCommentCount };
