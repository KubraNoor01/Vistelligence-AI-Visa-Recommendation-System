import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { BASE_URL } from '../../const';

const Model = ({ closeModal, postId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");

    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserId(user._id);
    }

    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/comment/GetComment?PostId=${postId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("You must be logged in to comment.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/comment/AddComment`,
        { PostId: postId, comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prevComments) => [response.data.comment, ...prevComments]);
      setCommentText("");

      // ✅ Live update the comment count in PostingCard
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg w-96 p-4 shadow-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' 
          : 'bg-white border border-gray-200 shadow-gray-200/50'
      }`}>
        <h3 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Comments
        </h3>

        <div className="space-y-4 max-h-60 overflow-auto">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className={`p-2 border-b transition-all duration-300 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <span className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {comment.userId?.username || "Unknown"}
                </span>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {comment.comment}
                </p>
              </div>
            ))
          ) : (
            <p className={`text-center transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No comments yet.
            </p>
          )}
        </div>

        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows="3"
          placeholder="Add a comment..."
          className={`w-full p-2 border rounded-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          } focus:outline-none`}
        ></textarea>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={handleSubmitComment}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Posting..." : "Submit"}
          </button>
          <button
            onClick={closeModal}
            className={`px-4 py-2 rounded-md transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Model;
