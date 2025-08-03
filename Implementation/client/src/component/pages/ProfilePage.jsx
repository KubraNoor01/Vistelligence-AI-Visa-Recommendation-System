import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";
import { FaEllipsisV, FaUser, FaImages, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";

function ProfilePage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({ username: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const { isDarkMode } = useTheme();

  const token = localStorage.getItem("authToken");
  const BASE_URL = "http://localhost:5000";

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/createPost/myposts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[Frontend] Fetched posts:", response.data);
      setPosts(response.data);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setMenuOpen(null);
    console.log("[Frontend] Attempting to delete post with ID:", postId);

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#374151' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingPost(postId);
      
      const response = await axios.delete(`${BASE_URL}/api/createPost/deletePost/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPosts((prev) => prev.filter((post) => post._id !== postId));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your post has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#16a34a',
          background: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        });
      }
    } catch (err) {
      console.error("[Frontend] Delete Error:", err.response || err);
      
      let errorMessage = "Failed to delete post.";
      if (err.response?.status === 403) {
        errorMessage = "You can only delete your own posts.";
      } else if (err.response?.status === 404) {
        errorMessage = "Post not found.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        background: isDarkMode ? '#374151' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setDeletingPost(null);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/userProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data?.user) setUser(response.data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
      fetchUserProfile();
    } else {
      setError("No token found. Please log in.");
      setLoading(false);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.menu-container')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className={`text-xl font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading your profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className={`text-xl font-medium text-red-500 mb-2`}>
              {error}
            </div>
            <div className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Please try refreshing the page
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <Navbar />
      
      {/* Hero Section */}
      <div className={`py-8 px-4 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' 
          : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              <FaUser className="text-white text-3xl" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {user.username}'s Profile
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your posts and profile
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className={`p-6 rounded-xl shadow-lg border transition-all duration-300 animate-slide-up ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-gray-50 border-gray-200 shadow-gray-200/50'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-blue-600/20' 
                  : 'bg-blue-100'
              }`}>
                <FaUser className={`text-2xl transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {user.username}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Username
              </div>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-green-600/20' 
                  : 'bg-green-100'
              }`}>
                <FaImages className={`text-2xl transition-colors duration-300 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {posts.length}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Posts
              </div>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-purple-600/20' 
                  : 'bg-purple-100'
              }`}>
                <FaEye className={`text-2xl transition-colors duration-300 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {posts.length > 0 ? 'Active' : 'New'}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Status
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Your Posts
              </h2>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {posts.length > 0 
                  ? `You have ${posts.length} post${posts.length !== 1 ? 's' : ''}`
                  : "You haven't created any posts yet"
                }
              </p>
            </div>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post, index) => {
              // Improved image path construction
              let imagePath = "default-image.jpg";
              if (post.picture) {
                // Handle both Windows and Unix path separators
                const fileName = post.picture.split(/[\\/]/).pop();
                imagePath = `${BASE_URL}/uploads/profileImages/${fileName}`;
              }

              return (
                <div 
                  key={post._id} 
                  className={`relative rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-105 animate-fade-in ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {post.picture && (
                    <div className="relative">
                      <img
                        src={imagePath}
                        alt={`Post ${index + 1}`}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x256?text=Image+Not+Found";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {post.name}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {post.description}
                    </p>
                  </div>

                  {/* Action Menu */}
                  <div className="absolute top-3 right-3 menu-container">
                    <button 
                      onClick={() => setMenuOpen(menuOpen === post._id ? null : post._id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700/80 hover:bg-gray-600/80 text-gray-300' 
                          : 'bg-white/80 hover:bg-gray-100/80 text-gray-600'
                      }`}
                    >
                      <FaEllipsisV className="text-sm" />
                    </button>
                    {menuOpen === post._id && (
                      <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-lg border py-2 z-10 transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          disabled={deletingPost === post._id}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-200 ${
                            deletingPost === post._id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } ${
                            isDarkMode 
                              ? 'text-red-400 hover:bg-red-900/20' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {deletingPost === post._id ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaTrash className="text-xs" />
                          )}
                          {deletingPost === post._id ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: 'Coming Soon!',
                              text: 'Edit functionality will be available in the next update.',
                              icon: 'info',
                              confirmButtonColor: '#3b82f6',
                              background: isDarkMode ? '#374151' : '#ffffff',
                              color: isDarkMode ? '#ffffff' : '#000000',
                            });
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-200 ${
                            isDarkMode 
                              ? 'text-blue-400 hover:bg-blue-900/20' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300'
            }`}>
              <FaImages className={`text-3xl transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
            </div>
            <div className={`text-xl font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              No posts yet
            </div>
            <div className={`max-w-md mx-auto transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Start sharing your amazing content with the community!
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default ProfilePage;
