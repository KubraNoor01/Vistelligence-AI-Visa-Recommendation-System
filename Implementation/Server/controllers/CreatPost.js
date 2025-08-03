const Post = require("../models/CreatePostModel");
const Category = require("../models/catagoriesModel");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { name, description, id } = req.body; 
    const userId = req.user.id; 
    console.log("userdata",userId)
    const picture = req.file ? req.file.path : null;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const post = new Post({ name, picture, description, category: id, user: userId });
    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all posts
const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: "approved" }; // Only show approved posts
    
    // If category is provided, filter by category
    if (category) {
      query.category = category;
    }
    
    const posts = await Post.find(query).populate("category", "name");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    // Extensive logging to debug the issue
    console.log("Accessing /myposts endpoint");

    if (!req.user || !req.user.id) {
      console.error("User ID not found in request after authentication.");
      return res.status(401).json({ message: "Authentication error: User ID not found." });
    }

    const userId = req.user.id;
    console.log(`Fetching posts for userId: ${userId} (type: ${typeof userId})`);

    // First, let's get all posts to see what's in the database
    const allPosts = await Post.find().populate("category", "name");
    console.log(`Total posts in database: ${allPosts.length}`);
    
    // Log all posts to see their user IDs
    allPosts.forEach((post, index) => {
      console.log(`All Post ${index + 1}: ID=${post._id}, User=${post.user} (type: ${typeof post.user}), Name=${post.name}, Status=${post.status}`);
    });

    // Now get only the user's approved posts
    const posts = await Post.find({ 
      user: userId, 
      status: "approved" 
    }).populate("category", "name");

    console.log(`Found ${posts.length} approved posts for userId: ${userId}`);
    
    // Log each post to verify they belong to the correct user
    posts.forEach((post, index) => {
      console.log(`User Post ${index + 1}: ID=${post._id}, User=${post.user}, Name=${post.name}`);
    });

    res.status(200).json(posts);
  } catch (error)
  {
    console.error("Error in getUserPosts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update post status (for admin)
const updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const user = await require('../models/UserModel').findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update post status" });
    }

    // Validate status
    const validStatuses = ['approved', 'reported', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be approved, reported, or declined" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Update post status
    post.status = status;
    await post.save();

    res.status(200).json({ 
      message: `Post ${status} successfully`,
      post 
    });
  } catch (error) {
    console.error("Error updating post status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {getPosts, createPost, getUserPosts, deletePost, updatePostStatus};