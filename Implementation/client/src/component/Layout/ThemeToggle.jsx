import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all duration-300 ease-in-out group"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #374151, #1f2937)' 
          : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
        boxShadow: isDarkMode 
          ? '0 4px 15px rgba(0, 0, 0, 0.3)' 
          : '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon */}
        <FaSun 
          className={`absolute transition-all duration-500 ease-in-out ${
            isDarkMode 
              ? 'text-yellow-400 opacity-100 rotate-0 scale-100' 
              : 'text-gray-600 opacity-0 rotate-90 scale-0'
          }`}
        />
        
        {/* Moon Icon */}
        <FaMoon 
          className={`absolute transition-all duration-500 ease-in-out ${
            isDarkMode 
              ? 'text-blue-300 opacity-0 -rotate-90 scale-0' 
              : 'text-gray-600 opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle; 