const mongoose = require('mongoose');
const UserModel = require('./models/UserModel');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to update user to admin
const updateUserToAdmin = async () => {
  try {
    await connectDB();
    
    const email = 'cae707988@gmail.com';
    
    // Find the user by email
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    console.log('✅ Found user:', user.username);
    console.log('Current role:', user.role);
    
    // Update the user's role to admin
    user.role = 'admin';
    await user.save();
    
    console.log('✅ Successfully updated Kubta Noor to admin role!');
    console.log('User details:');
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- New Role:', user.role);
    
    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating user to admin:', error);
    mongoose.connection.close();
  }
};

// Run the function
updateUserToAdmin(); 