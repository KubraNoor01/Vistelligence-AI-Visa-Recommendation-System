import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";
import { FaLock, FaSpinner, FaCheckCircle } from "react-icons/fa";
import Navbar from "../Layout/Navbar";
import { BASE_URL } from '../../const';

const ResetPass = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Weak Password',
                text: 'Password must be at least 8 characters long.',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/api/user/reset-password/${token}`, { newPassword });
            await Swal.fire({
                icon: 'success',
                title: 'Password Reset!',
                text: response.data.message || 'Your password has been changed successfully.',
                confirmButtonColor: '#16a34a',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
            });
            navigate('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Reset Failed',
                text: error.response?.data?.message || 'The reset link may be invalid or expired. Please try again.',
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
                <div className={`w-full max-w-md mx-auto rounded-2xl shadow-2xl p-8 transition-all duration-300 animate-fade-in-up ${isDarkMode ? "bg-gray-800 shadow-teal-500/10" : "bg-white shadow-gray-300/50"}`}>
                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full ${isDarkMode ? "bg-teal-600/20" : "bg-teal-100"}`}>
                            <FaLock className={`text-4xl ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />
                        </div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                            Set New Password
                        </h1>
                        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Please enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <FaLock className={`absolute top-1/2 left-4 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 ${
                                    isDarkMode 
                                        ? "bg-gray-700 border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500" 
                                        : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-teal-500 focus:border-teal-500"
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
                                    : (isDarkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600")
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-gray-800 focus:ring-teal-500" : "focus:ring-offset-white focus:ring-teal-500"}`}
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin mr-2" />
                            ) : (
                                <FaCheckCircle className="mr-2" />
                            )}
                            {loading ? "Resetting Password..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPass;