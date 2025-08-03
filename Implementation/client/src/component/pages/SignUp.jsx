import React, { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaUserPlus, 
  FaSpinner, 
  FaSignInAlt, 
  FaGlobe, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaStar
} from "react-icons/fa";
import Navbar from "../Layout/Navbar";
import FloatingParticles from "../Layout/FloatingParticles";
import PasswordStrength from "../Layout/PasswordStrength";
import { BASE_URL } from '../../const';

// Memoized InputField component outside to prevent recreation
const InputField = memo(({ name, type, placeholder, icon, value, error, isTouched, onChange, onBlur, isDarkMode }) => (
  <div className="relative group">
    <div className={`absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 ${
      isDarkMode ? "text-gray-400 group-focus-within:text-blue-500" : "text-gray-500 group-focus-within:text-blue-600"
    }`}>{icon}</div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
        isDarkMode
          ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
          : 'bg-white border-gray-300 text-gray-900'
      } ${
        isTouched && error
          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
          : `focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`
      }`}
      required
    />
    {isTouched && error && (
      <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
    )}
  </div>
));

const Signup = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.username) newErrors.username = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";

    if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)
    ) {
      newErrors.password = "Password must be 8+ characters, with an uppercase letter, a number, and a special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Only validate the specific field that was blurred
    setErrors(prev => {
      const newErrors = { ...prev };
      
      if (name === 'username' && !formData.username) {
        newErrors.username = "Username is required";
      } else if (name === 'username') {
        delete newErrors.username;
      }
      
      if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email address";
      } else if (name === 'email') {
        delete newErrors.email;
      }
      
      if (name === 'phoneNumber' && !formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (name === 'phoneNumber') {
        delete newErrors.phoneNumber;
      }
      
      if (name === 'password' && !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
        newErrors.password = "Password must be 8+ characters, with an uppercase letter, a number, and a special character.";
      } else if (name === 'password') {
        delete newErrors.password;
      }
      
      return newErrors;
    });
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      phoneNumber: true
    });

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please correct the errors before submitting.',
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/register`,
        formData
      );

      // Auto-login after successful registration
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }

      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Welcome to Vistelligence! You are now logged in.',
        confirmButtonColor: '#16a34a',
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
      
      // Navigate directly to chatbot page (default for authenticated users)
      navigate("/");

    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while registering. Please try again.";
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, isDarkMode, navigate]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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
              <FaUserPlus className={`text-2xl ${isDarkMode ? "text-blue-600 dark:text-blue-400" : "text-blue-600"}`} />
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-gray-900 dark:text-white" : "text-gray-900"}`}>
              Create Account
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-600 dark:text-gray-400" : "text-gray-600"}`}>
              Join Vistelligence and start your journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              name="username"
              type="text"
              placeholder="Username"
              icon={<FaUser />}
              value={formData.username}
              error={errors.username}
              isTouched={touched.username}
              onChange={handleChange}
              onBlur={handleBlur}
              isDarkMode={isDarkMode}
            />

            <InputField
              name="email"
              type="email"
              placeholder="Email Address"
              icon={<FaEnvelope />}
              value={formData.email}
              error={errors.email}
              isTouched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
              isDarkMode={isDarkMode}
            />

            <InputField
              name="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              icon={<FaPhone />}
              value={formData.phoneNumber}
              error={errors.phoneNumber}
              isTouched={touched.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              isDarkMode={isDarkMode}
            />

            <InputField
              name="password"
              type="password"
              placeholder="Password"
              icon={<FaLock />}
              value={formData.password}
              error={errors.password}
              isTouched={touched.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isDarkMode={isDarkMode}
            />

            {/* Password Strength Indicator */}
            {touched.password && (
              <PasswordStrength password={formData.password} isDarkMode={isDarkMode} />
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
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className={`text-sm ${isDarkMode ? "text-gray-600 dark:text-gray-400" : "text-gray-600"}`}>
              Already have an account?{" "}
              <Link
                to="/login"
                className={`font-medium hover:underline transition-colors duration-200 ${
                  isDarkMode ? "text-blue-600 dark:text-blue-400 hover:text-blue-500" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
