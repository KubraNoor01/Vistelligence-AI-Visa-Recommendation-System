import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  FaRobot, 
  FaShieldAlt, 
  FaFlag, 
  FaUser, 
  FaEnvelope,
  FaSpinner,
  FaCheckCircle,
  FaBan,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from '../../const';

function NonVerifyPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, blocked

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debug useEffect to monitor users state changes
  useEffect(() => {
    console.log('Users state updated:', users);
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${BASE_URL}/api/user/GetAllUser`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.user) {
        setUsers(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert('Failed to fetch users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      setProcessing(userId);
      const token = localStorage.getItem('authToken');
      
      console.log('Before API call - User ID:', userId, 'Current isBlocked:', isBlocked);
      
      const response = await axios.put(
        `${BASE_URL}/api/user/toggleBlock/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('API Response:', response.data);

      if (response.data.status === "success") {
        console.log('Updating user state with:', response.data.user);
        
        // Update the user's block status in local state using the returned user data
        setUsers(prev => {
          const updatedUsers = prev.map(user => 
            user._id === userId 
              ? { ...user, isBlocked: response.data.user.isBlocked }
              : user
          );
          console.log('Updated users state:', updatedUsers);
          return updatedUsers;
        });
        
        console.log('User status updated successfully');
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
      console.log('Failed to update user status:', error.response?.data?.message || 'Unknown error');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (isBlocked) => {
    if (isBlocked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <FaBan className="mr-1" />
          Blocked
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <FaCheckCircle className="mr-1" />
          Active
        </span>
      );
    }
  };

  const getActiveCount = (users) => {
    return users.filter(user => !user.isBlocked).length;
  };

  const getBlockedCount = (users) => {
    return users.filter(user => user.isBlocked).length;
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return !user.isBlocked;
    if (filter === 'blocked') return user.isBlocked;
    return true;
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
            <Link to="/report" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
              <FaFlag />
              <span>Reported Posts</span>
            </Link>
          </li>
          <li>
            <Link to="/notverify" className="flex items-center gap-2 text-blue-300 font-semibold">
              <FaShieldAlt />
              <span>User Management</span>
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
            <Link to="/report" className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors">
              <FaFlag className="text-2xl" />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/notverify" className="flex flex-col items-center text-sm text-blue-300 font-semibold">
              <FaShieldAlt className="text-2xl" />
              <span>Users</span>
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
              User Management Panel
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage user accounts and block/unblock users
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  }`}>Active Users</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{getActiveCount(users)}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <FaBan className="text-red-600 dark:text-red-400 text-xl" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Blocked Users</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{getBlockedCount(users)}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <FaUser className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Total Users</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{users.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { key: 'all', label: 'All Users', count: users.length },
              { key: 'active', label: 'Active', count: getActiveCount(users) },
              { key: 'blocked', label: 'Blocked', count: getBlockedCount(users) }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-blue-500 text-white shadow-lg'
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

        {/* Users Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="inline-block animate-spin text-4xl text-blue-500 mb-4" />
              <p className={`text-xl transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={`${user._id}-${user.isBlocked}`}
                className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                {/* User Avatar */}
                <div className="p-6 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    user.isBlocked 
                      ? 'bg-red-100 dark:bg-red-900' 
                      : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <FaUser className={`text-2xl ${
                      user.isBlocked 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {user.username}
                  </h3>
                  
                  <div className="flex items-center justify-center mb-4">
                    <FaEnvelope className={`mr-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {user.email}
                    </span>
                  </div>

                  <div className="mb-4">
                    {getStatusBadge(user.isBlocked)}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                    disabled={processing === user._id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                      user.isBlocked
                        ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white'
                        : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
                    }`}
                  >
                    {processing === user._id ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : user.isBlocked ? (
                      <FaToggleOn className="mr-2" />
                    ) : (
                      <FaToggleOff className="mr-2" />
                    )}
                    {user.isBlocked ? 'Unblock User' : 'Block User'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <FaUser className={`text-4xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              No users found
            </h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filter === 'all' 
                ? 'No users are registered yet.' 
                : `No ${filter} users found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NonVerifyPage;
