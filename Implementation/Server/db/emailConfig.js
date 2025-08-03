const nodemailer = require("nodemailer");
require('dotenv').config(); // Ensure environment variables are loaded

// Validate that environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials are not set in the .env file. Please set EMAIL_USER and EMAIL_PASS.");
    // Exit gracefully or use a mock transporter if in a test environment
    // For now, we'll log the error and let the app continue, though email will fail.
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: (process.env.EMAIL_PORT || 587) === 465, // `true` for 465, `false` for other ports
  auth: {
    // These credentials should be stored in your .env file
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

module.exports = { transporter };
