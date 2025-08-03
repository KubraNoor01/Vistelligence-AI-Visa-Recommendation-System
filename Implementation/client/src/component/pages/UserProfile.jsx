import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSignOutAlt, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../const';

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '', phoneNumber: '' });
  const [isEditable, setIsEditable] = useState({
    username: false,
    email: false,
    phoneNumber: false,
  });

  const handleBackClick = () => {
    navigate('/');
  };

  const handleEditClick = (field) => {
    setIsEditable((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUser((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/user/updateProfile`,
        {
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        setIsEditable({ username: false, email: false, phoneNumber: false });
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error('Error saving changes:', error.message);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/user/userProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-200">
      <nav className="text-white px-4 bg-gray-800 py-3 flex items-center">
        <button
          onClick={handleBackClick}
          className="flex items-center text-white font-medium hover:opacity-80 border-b-2 border-blue-500 mb-1"
        >
          <span className="text-xl">&lt;</span>
          <span className="ml-2 font-lexend">Back</span>
        </button>
      </nav>

      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md mt-24">
        <div className="w-full space-y-4">
          {['username', 'email', 'phoneNumber'].map((field) => (
            <div key={field} className="relative">
              <label htmlFor={field} className="block text-sm font-semibold text-gray-700 font-lexend">
                {field === 'username' ? 'Name' : field === 'email' ? 'Email' : 'Phone Number'}
              </label>
              <div className="relative w-full">
                <input
                  id={field}
                  type={field === 'email' ? 'email' : 'text'}
                  value={user[field] || ''}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-lg shadow-sm"
                  readOnly={!isEditable[field]}
                />
                <FaEdit
                  onClick={() => handleEditClick(field)}
                  className={`absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-500 cursor-pointer ${
                    isEditable[field] ? 'text-red-500' : ''
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSaveChanges}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:bg-green-600 hover:scale-105 shadow-md hover:shadow-lg"
        >
          <FaSave />
          <span>Save Changes</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:bg-red-600 hover:scale-105 shadow-md hover:shadow-lg"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
