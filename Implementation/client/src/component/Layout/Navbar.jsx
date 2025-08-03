import React, { useState, useEffect, useRef } from "react";
import {
  FaCog,
  FaTwitch,
  FaRobot,
  FaPlusCircle,
  FaBus,
  FaUser,
  FaSignInAlt,
  FaShieldAlt,
  FaClipboardList,
} from "react-icons/fa"; // Import icons
import { Link } from "react-router-dom";
import { AiFillCheckCircle } from "react-icons/ai";
import NotificationDropdown from "./NotificationDropdown";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false); // Track authentication
  const [userRole, setUserRole] = useState(null); // Track user role
  const dropdownRef = useRef(null); // Ref to dropdown menu
  const { isDarkMode } = useTheme();

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Check if the user is authenticated on initial load
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setAuthenticated(true);
      
      // Get user role from localStorage
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      }
    }
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    setUserRole(null);
    // Clear authentication-related storage (like localStorage)
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={`hidden sm:flex items-center justify-between p-4 shadow-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white' 
          : 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white'
      }`}>
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            {/* Circular Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full overflow-hidden">
              <img
                src="images/vintageLogo.jpg"
                alt="Vintage Logo"
                className="object-cover w-full h-full"
              />
            </div>
            {/* Text */}
          </Link>
           </div>

        <ul className="flex gap-6 items-center mt-[14px]">
          <li className="mr-7 text-2xl hover:underline decoration-2 underline-offset-8">
            <Link
              to="/"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-200"
            >
              <FaRobot />
              <span className="mt-1">Vistelligence</span>
            </Link>
          </li>
          <li>
            <Link
              to="/community"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-200"
            >
              <FaTwitch />
              <span className="mt-1">Community Posts</span>
            </Link>
          </li>
          <li>
            <Link
              to="/create-post"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-200"
            >
              <FaPlusCircle />
              <span className="mt-1">Create Post</span>
            </Link>
          </li>
          <li>
            <Link
              to="/account"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-200"
            >
              <FaUser />
              <span className="mt-1">Profile</span>
            </Link>
          </li>
          {/* Admin Links - Only show for admin users */}
          {isAuthenticated && userRole === 'admin' && (
            <>
              <li>
                <Link
                  to="/report"
                  className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-200"
                >
                  <FaShieldAlt />
                  <span className="mt-1">Admin Panel</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/notverify"
                  className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-200"
                >
                  <FaClipboardList />
                  <span className="mt-1">Verify Posts</span>
                </Link>
              </li>
            </>
          )}
          {isAuthenticated && (
            <li>
              <NotificationDropdown />
            </li>
          )}
          <li>
            <ThemeToggle />
          </li>
        </ul>
        
        <div
          className="relative"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <div className="flex items-center cursor-pointer rounded">
            <FaCog className="text-2xl cursor-pointer hover:text-gray-300 transition-colors duration-200" />
        <p className="ml-2 mt-4">Settings</p>
</div>

          {isDropdownOpen && (
            <div
              ref={dropdownRef} // Attach ref to dropdown menu
              className={`absolute right-0 mt-2 w-40 shadow-lg rounded-md z-50 transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <ul>
                <li>
                  <Link
                    to="/UserProfile"
                    className={`block px-4 py-2 hover:bg-opacity-80 transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Setting
                  </Link>
                </li>
                {!isAuthenticated ? (
                  <li>
                    <Link
                      to="/login"
                      className={`block px-4 py-2 hover:bg-opacity-80 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Login
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/login"
                      className={`block px-4 py-2 hover:bg-opacity-80 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={handleLogout}
                    >
                      Logout
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className={`fixed bottom-0 left-0 w-full shadow-lg sm:hidden z-50 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white' 
          : 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white'
      }`}>
        <ul className="flex justify-around items-center p-2">
          <li>
            <Link
              to="/community"
              className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors duration-200"
            >
              <FaTwitch className="text-2xl" />
              <span>Community Posts</span>
            </Link>
          </li>
          <li>
            <Link
              to="/create-post"
              className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors duration-200"
            >
              <FaPlusCircle className="text-2xl" />
              <span>Post</span>
            </Link>
          </li>

          <li>
            <Link
              to="/account"
              className="flex flex-col items-center text-sm cursor-pointer hover:text-gray-300 transition-colors duration-200"
            >
              <FaUser className="text-2xl" />
              <span>Account</span>
            </Link>
          </li>
          {/* Admin Links for Mobile - Only show for admin users */}
          {isAuthenticated && userRole === 'admin' && (
            <>
              <li>
                <Link
                  to="/report"
                  className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors duration-200"
                >
                  <FaShieldAlt className="text-2xl" />
                  <span>Admin</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/notverify"
                  className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors duration-200"
                >
                  <FaClipboardList className="text-2xl" />
                  <span>Verify</span>
                </Link>
              </li>
            </>
          )}
          {isAuthenticated && (
            <li>
              <div className="flex flex-col items-center text-sm">
                <NotificationDropdown />
                <span className="text-xs mt-1">Notifications</span>
              </div>
            </li>
          )}
          <li>
            <div className="flex flex-col items-center text-sm">
              <ThemeToggle />
              <span className="text-xs mt-1">Theme</span>
            </div>
          </li>
          {!isAuthenticated ? (
                  <li>
                    <Link
                      to="/login"
                className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors duration-200"
                    >
                      <FaSignInAlt className="text-2xl" /> {/* Login Icon */}
                       <span>Login</span>
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/login"
                className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors duration-200"
                      onClick={handleLogout}
                    >
                       <FaSignInAlt className="text-2xl" /> {/* Login Icon */}
                       <span>Logout</span>
                    </Link>
                  </li>
                )}
        </ul>
        <Link
          to="/"
          className="fixed bottom-[100px] right-5 sm:hidden w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50"
        >
          <FaRobot className="text-white text-2xl" />
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
