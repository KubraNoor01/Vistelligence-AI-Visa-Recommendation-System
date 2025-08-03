import React, { useState, useEffect } from "react";
import { FaTimes, FaFilter } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const SideFilter = ({ categories, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { isDarkMode } = useTheme();

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
  };

  // Only trigger filtering when selectedCategories changes
  useEffect(() => {
    onFilterChange(selectedCategories);
  }, [selectedCategories]); // Remove `onFilterChange` from dependencies

  return (
    <div className={`w-full rounded-xl shadow-lg border transition-all duration-300 animate-fade-in max-h-[calc(100vh-8rem)] overflow-y-auto scroll-smooth ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
        : 'bg-gray-50 border-gray-200 shadow-gray-200/50'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-all duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="mb-2">
          <h2 className={`text-lg font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Categories
          </h2>
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Filter posts by category
          </p>
        </div>
        
        {selectedCategories.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-2 mt-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <FaTimes className="text-xs" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className="p-6">
        {/* Categories List */}
        <div className="space-y-3">
        {categories.length > 0 ? (
          categories.map((category) => (
              <div key={category._id} className="group">
                <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-100'
                }`}>
              <input
                type="checkbox"
                value={category._id}
                checked={selectedCategories.includes(category._id)}
                onChange={handleCategoryChange}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
              />
                  <span className={`font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-200 group-hover:text-blue-300' 
                      : 'text-gray-700 group-hover:text-blue-700'
                  }`}>
                    {category.name}
                  </span>
                  
                  {/* Selection indicator */}
                  {selectedCategories.includes(category._id) && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </label>
            </div>
          ))
        ) : (
            <div className="text-center py-8">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <FaFilter className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Loading categories...
              </p>
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedCategories.length > 0 && (
          <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700/50' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
              </span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {selectedCategories.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideFilter;
