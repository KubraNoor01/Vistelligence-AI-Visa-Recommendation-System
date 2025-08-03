import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";
import { FaEnvelope, FaPaperPlane, FaSpinner } from "react-icons/fa";
import Navbar from "../Layout/Navbar";
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../const';

function ForgotPass() {
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${BASE_URL}/api/user/forgot-password`, { email });
            Swal.fire({
                icon: 'success',
                title: 'Check Your Email!',
                text: response.data.message || 'If an account with that email exists, a password reset link has been sent.',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
            });
        } catch (error) {
            console.error('Error sending reset link:', error);
            Swal.fire({
                icon: 'error',
                title: 'Request Failed',
                text: error.response?.data?.message || 'Could not send reset link. Please try again.',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className={`w-full max-w-md mx-auto rounded-2xl shadow-2xl p-8 transition-all duration-300 animate-fade-in-up ${isDarkMode ? "bg-gray-800 shadow-purple-500/10" : "bg-white shadow-gray-300/50"}`}>
                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full ${isDarkMode ? "bg-purple-600/20" : "bg-purple-100"}`}>
                            <FaEnvelope className={`text-4xl ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        </div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                            Forgot Your Password?
                        </h1>
                        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            No problem. Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <FaEnvelope className={`absolute top-1/2 left-4 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 ${
                                    isDarkMode 
                                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500" 
                                        : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-purple-500 focus:border-purple-500"
                                }`}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                                loading 
                                    ? (isDarkMode ? "bg-gray-600" : "bg-gray-400") 
                                    : (isDarkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600")
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-gray-800 focus:ring-purple-500" : "focus:ring-offset-white focus:ring-purple-500"}`}
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin mr-2" />
                            ) : (
                                <FaPaperPlane className="mr-2" />
                            )}
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link 
                            to="/login" 
                            className={`font-semibold text-sm transition-colors duration-300 ${
                                isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"
                            }`}
                        >
                            &larr; Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPass;
