import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart, FaRegComment, FaEllipsisH } from "react-icons/fa";
import Modal from "../Model/Model";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from '../../const';

const PostingCard = ({ post }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUserId = localStorage.getItem("userData");
    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!userId || !post._id) return;

    fetchLikeStatus();
    fetchCommentCount();
  }, [userId, post._id]);

  const fetchLikeStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/like/GetLikes?PostId=${post._id}&UserId=${userId}`);
      if (response.data.success) {
        setLikeCount(response.data.totalLikes || 0);
        const isLiked = response.data.userLiked || localStorage.getItem(`liked_${post._id}_${userId}`) === "true";
        setLiked(isLiked);
      }
    } catch (error) {
      console.error("Error fetching likes:", error.response?.data?.message || error.message);
    }
  };

  const fetchCommentCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/comment/count?postId=${post._id}`);
      if (res.data.success) {
        setCommentCount(res.data.totalComments || 0);
      }
    } catch (err) {
      console.error("Error fetching comment count:", err.response?.data?.message || err.message);
    }
  };

  const toggleLike = async () => {
    if (!userId || !token) {
      console.error("User is not authenticated. Please log in.");
      return;
    }

    try {
      if (liked) {
        const response = await axios.delete(`${BASE_URL}/api/like/DeleteLikes`, {
          data: { UserId: userId, PostId: post._id },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setLikeCount((prev) => Math.max(prev - 1, 0));
          setLiked(false);
          localStorage.setItem(`liked_${post._id}_${userId}`, "false");
        }
      } else {
        const response = await axios.post(
          `${BASE_URL}/api/like/AddLike`,
          { UserId: userId, PostId: post._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setLikeCount((prev) => prev + 1);
          setLiked(true);
          localStorage.setItem(`liked_${post._id}_${userId}`, "true");
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
        }
      }
    } catch (error) {
      console.error("Error liking/unliking the post:", error.response?.data?.message || error.message);
    }
  };

  const onReportPost = async () => {
    if (!userId || !token) {
      console.error("User is not authenticated. Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/post/report`,
        { postId: post._id, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Post reported successfully.");
      }
    } catch (error) {
      console.error("Error reporting post:", error.response?.data?.message || error.message);
    }
  };

  const handleOpenModal = (postId) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  return (
    <div className="relative mt-4 w-full sm:w-80 max-w-sm p-4 box-border">
      <div className={`border rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
          : 'bg-white border-gray-200 shadow-gray-200/50'
      }`}>
        <div className="flex items-center p-4">
          <span className={`font-semibold font-lexend text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {post.name}
          </span>
          <div className="ml-auto relative flex flex-col items-end">
            <FaEllipsisH
              className={`cursor-pointer text-xl transform rotate-90 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              }`}
              onClick={() => setOptionsVisible(!isOptionsVisible)}
            />
            {isOptionsVisible && (
              <div className={`absolute top-full right-0 mt-2 w-32 shadow-lg rounded-md z-10 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-white border border-gray-200'
              }`}>
                <ul>
                  <li className={`px-4 py-2 cursor-pointer transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`} onClick={onReportPost}>
                    Report
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-56 overflow-hidden">
          <img src={post.picture ? `${BASE_URL}/uploads/profileImages/${post.picture.split("\\").pop()}` : "default-image.jpg"} alt="Post" className="w-full h-full object-cover" />
        </div>

        <p className={`p-4 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {post.description}
        </p>

        {isModalOpen && (
          <Modal
            closeModal={() => setIsModalOpen(false)}
            postId={selectedPostId}
            onCommentAdded={fetchCommentCount} // ✅ REFRESH COMMENT COUNT HERE
          />
        )}
      </div>

      <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-4">
        <div className={`-bottom-8 w-[130px] sm:w-[130px] md:w-[140px] lg:w-[150px] flex items-center justify-between rounded-md p-4 rounded-br-[100px] transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' 
            : 'bg-white border border-gray-200 shadow-gray-200/50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center space-x-1">
              {liked && isAnimating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaHeart className="text-red-600 text-3xl animate-ping" />
                </div>
              )}
              {liked ? (
                <FaHeart className="text-red-600 cursor-pointer text-xl" onClick={toggleLike} />
              ) : (
                <FaRegHeart className={`cursor-pointer text-xl transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                }`} onClick={toggleLike} />
              )}
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {likeCount}
              </span>
            </div>

            {/* ✅ COMMENT ICON + COUNT */}
            <div className="flex items-center space-x-1 cursor-pointer" onClick={() => handleOpenModal(post._id)}>
              <FaRegComment className={`text-xl transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              }`} />
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingCard;
