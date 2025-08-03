import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaUserPlus, FaGlobe, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import Navbar from "../Layout/Navbar";
import FloatingParticles from "../Layout/FloatingParticles";
import { BASE_URL } from '../../const';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, formData);

      if (response.status === 200) {
        const { token, user } = response.data;

        if (user.isBlocked) {
          Swal.fire({
            icon: 'error',
            title: 'Account Blocked',
            text: 'Your account has been blocked and you cannot access this website. Please contact the administrator for assistance.',
            html: `
              <div class="text-left">
                <p class="mb-3">Your account has been blocked and you cannot access this website.</p>
                <p class="mb-3"><strong>Please contact the administrator:</strong></p>
                <p class="mb-2">📧 Email: <a href="mailto:admin@vistelligence.com" class="text-blue-600 hover:underline">admin@vistelligence.com</a></p>
                <p class="text-sm text-gray-600 mt-3">We will review your case and get back to you as soon as possible.</p>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc2626',
            background: isDarkMode ? '#374151' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
          setLoading(false);
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(user));

        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
          timer: 1500,
          showConfirmButton: false,
          background: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        });

        if (user.role === "admin") {
          navigate("/report");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Check your credentials and try again.";
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gray-50 dark:bg-gray-900" 
        : "bg-gray-50"
    }`}>
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className={`w-full max-w-md mx-auto rounded-xl shadow-lg p-8 transition-all duration-300 ${
          isDarkMode 
            ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" 
            : "bg-white border border-gray-200"
        }`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
              isDarkMode 
                ? "bg-blue-100 dark:bg-blue-900" 
                : "bg-blue-100"
            }`}>
              <FaSignInAlt className={`text-2xl ${isDarkMode ? "text-blue-600 dark:text-blue-400" : "text-blue-600"}`} />
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-gray-900 dark:text-white" : "text-gray-900"}`}>
              Welcome Back!
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-600 dark:text-gray-400" : "text-gray-600"}`}>
              Sign in to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <FaEnvelope className={`absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 ${
                isDarkMode ? "text-gray-400 group-focus-within:text-blue-500" : "text-gray-500 group-focus-within:text-blue-600"
              }`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
                required
              />
            </div>

            <div className="relative group">
              <FaLock className={`absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 ${
                isDarkMode ? "text-gray-400 group-focus-within:text-blue-500" : "text-gray-500 group-focus-within:text-blue-600"
              }`} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/Forget"
              className={`block text-sm hover:underline transition-colors duration-200 ${
                isDarkMode ? "text-blue-600 dark:text-blue-400 hover:text-blue-500" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Forgot your password?
            </Link>
            
            <div className={`text-sm ${isDarkMode ? "text-gray-600 dark:text-gray-400" : "text-gray-600"}`}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className={`font-medium hover:underline transition-colors duration-200 ${
                  isDarkMode ? "text-blue-600 dark:text-blue-400 hover:text-blue-500" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
