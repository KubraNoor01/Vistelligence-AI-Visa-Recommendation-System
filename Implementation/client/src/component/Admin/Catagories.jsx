import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  FaRobot, 
  FaFlag, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaUser, 
  FaCalendar,
  FaImage,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaTrash,
  FaBan
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";
import { BASE_URL } from '../../const';

const Categories = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all'); // all, reported, pending
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BASE_URL}/api/post/reported`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReportedPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching reported posts:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch reported posts',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (postId, action) => {
    try {
      setProcessing(postId);
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        Swal.fire({
          title: 'Unauthorized!',
          text: 'No authentication token found',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          background: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        });
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/api/post/updateStatus`, 
        { postId, status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove the post from the list after successful action
        setReportedPosts(prev => prev.filter(post => post._id !== postId));
        
        Swal.fire({
          title: 'Success!',
          text: response.data.message || `Post ${action}d successfully`,
          icon: 'success',
          confirmButtonColor: '#16a34a',
          background: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || `Failed to ${action} post`,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '⏳' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✅' },
      declined: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: '❌' }
    };
    
    // Default to pending if no status or status is 'reported'
    const actualStatus = status && status !== 'reported' ? status : 'pending';
    const config = statusConfig[actualStatus] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
      </span>
    );
  };

  const getPendingCount = (posts) => {
    return posts.filter(post => !post.status || post.status === 'reported' || post.status === 'pending').length;
  };

  const getReportCount = (posts) => {
    return posts.filter(post => post.status === 'reported').length;
  };

  const getApprovedCount = (posts) => {
    return posts.filter(post => post.status === 'approved').length;
  };

  const getDeclinedCount = (posts) => {
    return posts.filter(post => post.status === 'declined').length;
  };

  const filteredPosts = reportedPosts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !post.status || post.status === 'reported' || post.status === 'pending';
    return post.status === filter;
  });

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Enhanced Navbar */}
      <nav className={`hidden sm:flex justify-between items-center w-full p-4 shadow-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white' 
          : 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white'
      }`}>
        <Link to="/" className="text-2xl font-bold flex items-center">
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <img src="images/vintageLogo.jpg" alt="Vintage Logo" className="object-cover w-full h-full" />
          </div>
        </Link>
        <ul className="flex gap-6 items-center justify-center flex-1">
          <li>
            <Link to="/report" className="flex items-center gap-2 text-blue-300 font-semibold">
              <FaFlag />
              <span>Reported Posts</span>
            </Link>
          </li>
          <li>
            <Link to="/notverify" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
              <FaShieldAlt />
              <span>Verify Posts</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Navbar */}
      <nav className={`fixed bottom-0 left-0 w-full shadow-lg sm:hidden z-50 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white' 
          : 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white'
      }`}>
        <ul className="flex justify-around items-center p-2">
          <li>
            <Link to="/report" className="flex flex-col items-center text-sm text-blue-300 font-semibold">
              <FaFlag className="text-2xl" />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/notverify" className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors">
              <FaShieldAlt className="text-2xl" />
              <span>Verify</span>
            </Link>
          </li>
        </ul>
        <Link to="/" className="fixed bottom-[100px] right-5 sm:hidden w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50">
          <FaRobot className="text-white text-2xl" />
        </Link>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Reported Posts Management
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Review and manage posts that have been reported by users
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Pending</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{getPendingCount(reportedPosts)}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Approved</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{getApprovedCount(reportedPosts)}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  <FaTimes className="text-gray-600 dark:text-gray-400 text-xl" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Declined</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{getDeclinedCount(reportedPosts)}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <FaShieldAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Total</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{reportedPosts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { key: 'all', label: 'All Reports', count: reportedPosts.length },
              { key: 'pending', label: 'Pending', count: getPendingCount(reportedPosts) },
              { key: 'approved', label: 'Approved', count: getApprovedCount(reportedPosts) },
              { key: 'declined', label: 'Declined', count: getDeclinedCount(reportedPosts) }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-red-500 text-white shadow-lg'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="inline-block animate-spin text-4xl text-red-500 mb-4" />
              <p className={`text-xl transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Loading reported posts...</p>
            </div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const imagePath = post.picture
                ? `${BASE_URL}/uploads/profileImages/${post.picture.split("\\").pop()}`
                : null;

              return (
                <div
                  key={post._id}
                  className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  {/* Post Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {imagePath ? (
                      <img
                        src={imagePath}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaImage className="text-4xl text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(post.status)}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-lg font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {post.userName || 'Unknown User'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <FaUser className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <FaCalendar className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-4 line-clamp-3 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {post.description}
                    </p>

                    {/* Report Reason (if available) */}
                    {post.reportReason && (
                      <div className={`mb-4 p-3 rounded-lg ${
                        isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-red-300' : 'text-red-700'
                        }`}>
                          Report Reason: {post.reportReason}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(post._id, "approve")}
                        disabled={processing === post._id}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                      >
                        {processing === post._id ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaCheckCircle className="mr-2" />
                        )}
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleAction(post._id, "decline")}
                        disabled={processing === post._id}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                      >
                        {processing === post._id ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaTimes className="mr-2" />
                        )}
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <FaFlag className={`text-4xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              No reported posts
            </h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filter === 'all' 
                ? 'All reported posts have been processed.' 
                : filter === 'pending'
                ? 'No pending posts to review.'
                : `No ${filter} posts found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
