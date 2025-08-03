import React, { useEffect, useState } from "react";
import axios from "axios";
import { notification } from "antd";
import Navbar from "../Layout/Navbar";
import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeContext";
import { 
  FaUser, 
  FaImage, 
  FaFileUpload, 
  FaEdit, 
  FaListUl, 
  FaSpinner,
  FaPlus,
  FaTimes
} from "react-icons/fa";
import "antd/dist/reset.css";
import { BASE_URL } from '../../const';

function Createpost() {
  const [formData, setFormData] = useState({
    Name: "",
    imageUrl: null,
    description: "",
    category: "",
  });

  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await axios.get(`${BASE_URL}/api/user/userProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.user) {
          setFormData((prev) => ({ ...prev, Name: response.data.user.username }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile");
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await axios.get(`${BASE_URL}/api/catagories/getCatagories`);
        if (response.data && response.data.data) {
        setCategories(response.data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to fetch categories");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (token) {
    fetchUserProfile();
    fetchCategories();
    } else {
      setError("No authentication token found");
      setProfileLoading(false);
      setCategoriesLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageUrl: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: null });
    setPreviewImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Name || !formData.imageUrl || !formData.description || !formData.category) {
      notification.error({
        message: "Validation Error",
        description: "All fields are required.",
        placement: "topRight",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.Name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("id", formData.category);
    if (formData.imageUrl) {
      formDataToSend.append("image", formData.imageUrl);
    }

    try {
      setLoading(true);
      const postsResponse = await axios.post(
        `${BASE_URL}/api/createPost/posts`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (postsResponse.data.message) {
        Swal.fire({
          title: "Post Created!",
          text: "Your post has been published successfully.",
          icon: "success",
          confirmButtonColor: "#16a34a",
          background: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        }).then(() => {
          setFormData(prev => ({
            ...prev,
          imageUrl: null,
          description: "",
          category: "",
          }));
          setPreviewImage("");
        });
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Failed to create post.",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-4xl mx-auto text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            <FaPlus className="text-white text-2xl" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Create New Post
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Share your thoughts and ideas with the community
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-700 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">{error}</span>
            </div>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              Please refresh the page or try again later.
            </p>
          </div>
        )}

        <div className={`p-8 rounded-2xl shadow-xl border transition-all duration-300 animate-slide-up ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-gray-50 border-gray-200 shadow-gray-200/50'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaUser className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                Username
              </label>
              {profileLoading ? (
                <div className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <FaSpinner className="animate-spin text-sm" />
                    Loading profile...
                  </div>
                </div>
              ) : (
              <input
                type="text"
                name="Name"
                value={formData.Name}
                readOnly
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                  }`}
              />
              )}
            </div>

            {/* Category Field */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaListUl className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
                Category
              </label>
              {categoriesLoading ? (
                <div className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <FaSpinner className="animate-spin text-sm" />
                    Loading categories...
                  </div>
                </div>
              ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-purple-500 focus:ring-purple-500' 
                      : 'bg-white border-gray-300 text-gray-700 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              )}
            </div>

            {/* Image Upload Field */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaImage className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                Post Image
              </label>
              
              {!previewImage ? (
                <div className="relative">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 hover:border-opacity-80 ${
                    isDarkMode 
                      ? 'border-gray-600 hover:border-green-500' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <FaFileUpload className={`mx-auto text-4xl mb-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <p className={`mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Click to upload or drag and drop
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaEdit className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`} />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Share your thoughts, ideas, or story..."
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 resize-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500'
                }`}
                rows="5"
                required
              ></textarea>
              <div className={`text-xs mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || profileLoading || categoriesLoading || !formData.Name}
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || profileLoading || categoriesLoading || !formData.Name
                    ? `cursor-not-allowed ${
                        isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-400 text-gray-600'
                      }`
                    : `${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
                      } transform hover:scale-105 active:scale-95`
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating Post...
                  </>
                ) : profileLoading || categoriesLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Createpost;
