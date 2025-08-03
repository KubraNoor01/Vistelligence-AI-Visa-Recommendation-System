import React, { useState, useEffect } from "react";
import axios from "axios";
import PostingCard from "./PostingCard";
import SideFilter from "./SideFilter";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { BASE_URL } from '../../const';

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isDarkMode } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/catagories/getCatagories`);
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch posts based on selected categories
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let allPosts = [];
        
        if (selectedCategories.length > 0) {
          // Fetch posts for each selected category
          const promises = selectedCategories.map(categoryId =>
            axios.get(`${BASE_URL}/api/createPost/getposts?category=${categoryId}`)
          );
          
          const responses = await Promise.all(promises);
          responses.forEach(response => {
            allPosts = [...allPosts, ...response.data];
          });
          
          // Remove duplicates based on post ID
          const uniquePosts = allPosts.filter((post, index, self) =>
            index === self.findIndex(p => p._id === post._id)
          );
          
          setPosts(uniquePosts);
          setFilteredPosts(uniquePosts);
        } else {
          // Fetch all posts when no category is selected
          const response = await axios.get(`${BASE_URL}/api/createPost/getposts`);
          setPosts(response.data);
          setFilteredPosts(response.data);
        }
        
        setError(null);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategories]);

  // Filter posts based on search term
  useEffect(() => {
    let filtered = posts;

    if (searchTerm.trim()) {
      filtered = filtered.filter((post) =>
        post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm]);

  const handleFilterChange = (categoryIds) => {
    setSelectedCategories(categoryIds);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <Navbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Mobile Filter Button */}
        <div className="md:hidden p-4">
          <button
            onClick={toggleFilter}
            className={`p-2 rounded-md ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <FaFilter />
          </button>
        </div>

        {/* Sidebar */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={toggleFilter}
            />
            {/* Filter Panel */}
            <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 md:hidden overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Filters
                  </h3>
                  <button
                    onClick={toggleFilter}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FaTimes />
                  </button>
                </div>
                <SideFilter
                  categories={categories}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </>
        )}

        <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/6 p-4">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-lg rounded-xl transition-all duration-300">
            <SideFilter
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 lg:w-4/5 xl:w-5/6 p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Community Posts
                </h1>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Total Posts: {filteredPosts.length}
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <div className="relative">
                  <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`} />
                  <input
                    type="text"
                    placeholder="Search posts by name or description..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategories.length > 0 || searchTerm) && (
              <div className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDarkMode ? "text-blue-200" : "text-blue-800"}`}>
                    Active Filters:
                  </span>
                  {selectedCategories.length > 0 && (
                    <span className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                      Categories: {selectedCategories.length}
                    </span>
                  )}
                  {searchTerm && (
                    <span className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                      Search: "{searchTerm}"
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
                >
                  <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-xl">{error}</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPosts.map((post) => (
                <div key={post._id}>
                  <PostingCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">No Posts Found</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedCategories.length > 0
                  ? "No posts match your current filters. Try adjusting your search or category selection."
                  : "There are no posts available at the moment."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
