const UserModel = require('../models/UserModel');
const bcrypt =require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {transporter} = require("../db/emailConfig")

const registerUser = async(req,res)=>{
    try {
        const { username, email, password, phoneNumber } = req.body;

        // Validate input fields
        if (!username || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if username or email is already registered
        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
        }
        
        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'This email is already registered. Please login.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserModel({ username, email, phoneNumber, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        // Handle potential duplicate key errors from the database
        if (error.code === 11000) {
            // Determine which field caused the error
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `This ${field} is already in use.` });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ status: "failed", message: "User not found" });
        }

        if (user.isBlocked) {
          return res.status(403).json({ status: "failed", message: "You are blocked and cannot log in." });
      }

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "failed", message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '5d' }
        );

        // Return success response with token
        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            user:user
        });
    } catch (error) {
        console.error("The internal error", error);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

const userProfile = async (req, res) => {
    try {
      // The user ID is in the decoded token (req.user._id)
      const user = await UserModel.findById(req.user.id);
  
      // If the user is found, return the user details
      if (user) {
        return res.status(200).json({
          status: "success",
          message: "User successfully found",
          user,  // Send the user object in the response
        });
      } else {
        // If the user is not found, return a 404 error
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }
    } catch (error) {
      // Log the error to the server logs
      console.error("Internal error:", error.message);
  
      // Return a 500 Internal Server Error response
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
        error: error.message,  // Send the error message to help debugging
      });
    }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, phoneNumber } = req.body;

    // Find the user and update their profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { username, email, phoneNumber },
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      return res.status(200).json({
        status: 'success',
        message: 'User profile updated successfully',
        user: updatedUser,
      });
    } else {
      return res.status(404).json({
        status: 'failed',
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error.message);
    return res.status(500).json({
      status: 'failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const ForgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "Failed", message: "User not found" });
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    // Save user with reset token
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // Send reset email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.status(200).json({ message: "Password reset link sent to your email." });

  } catch (error) {
    console.error("Error in forget password:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await UserModel.findOne({ 
      resetToken: token, 
      resetTokenExpiry: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear reset token and expiry
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Save updated user
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

const getAllUsers = async(req, res)=>{
  try {
    const user = await UserModel.find()
    res.status(200).json({status:"success", message:"success fetching the data", user})
  } catch (error) {
    res.status(500).json({status:"failed", message:"Server error"})
    
  }
};

const toggleBlockUser = async (req, res) => {
  try {
      const { userId } = req.params;
      console.log('Toggle block request for user ID:', userId);

      const user = await UserModel.findById(userId);
      if (!user) {
          console.log('User not found');
          return res.status(404).json({ status: "failed", message: "User not found" });
      }

      console.log('User found:', user.username, 'Current isBlocked:', user.isBlocked);
      user.isBlocked = !user.isBlocked; // Toggle the block status
      await user.save();
      console.log('User updated, new isBlocked:', user.isBlocked);

      const response = { 
        status: "success", 
        message: `User is now ${user.isBlocked ? "Blocked" : "Unblocked"}`,
        user: user // Return the updated user data
      };
      
      console.log('Sending response:', response);
      res.status(200).json(response);
  } catch (error) {
      console.error("Error toggling user block:", error);
      res.status(500).json({ status: "failed", message: "Internal server error" });
  }
};

module.exports = {registerUser, loginUser, userProfile, updateUserProfile, toggleBlockUser, ForgetPassword, resetPassword, getAllUsers }