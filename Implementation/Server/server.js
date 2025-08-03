const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/Dbconfig');
const userRoutes = require('./routes/userRoutes')
const CategoriesRoutes = require("./routes/catagoriesRoutes")
const createPost = require("./routes/createPostRoutes")
const createComment = require("./routes/Comment")
const CreateLike = require("./routes/Likes")
const path = require('path'); // Import path module
const createRepost = require("./routes/repost")
const notificationRoutes = require("./routes/Notification")


// Load environment variables
dotenv.config();

// Initialize app
const app = express();



// Connect to database
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Routes
app.use('/api/user', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/catagories', CategoriesRoutes)
app.use('/api/createPost', createPost);
app.use('/api/like', CreateLike);
app.use("/api/comment", createComment);
app.use("/api/post", createRepost)
app.use("/api/notifications", notificationRoutes)


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`The Server is running in the http://localhost:${PORT}`));

