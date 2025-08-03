import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaTimes } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from '../../const';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await axios.put(`${BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await axios.put(`${BASE_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-300 hover:shadow-md ${
          isDarkMode 
            ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border z-50 max-h-96 overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-gray-50 border-gray-200 shadow-gray-200/50'
        }`}>
          <div className={`p-4 border-b transition-all duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Notifications
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className={`text-xs transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300 disabled:opacity-50' 
                        : 'text-blue-600 hover:text-blue-800 disabled:opacity-50'
                    }`}
                  >
                    {loading ? "Marking..." : "Mark all read"}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700/50' 
                      : 'border-gray-200 hover:bg-gray-100'
                  } ${!notification.isRead ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 transition-all duration-300 ${
                        notification.isRead 
                          ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400') 
                          : 'bg-blue-500 animate-pulse'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        <span className={`font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {notification.sender?.username || "Unknown"}
                        </span>
                        {" "}
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`p-4 text-center transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 