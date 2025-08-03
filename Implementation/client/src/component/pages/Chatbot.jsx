import React, { useState, useEffect, useRef } from "react";
import Navbar from "../Layout/Navbar";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { isDarkMode } = useTheme();
  const [userName, setUserName] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.name) {
        setUserName(userData.name);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }, []);

  // Simplified Q&A for cleaner display
  const visaQA = {
    "What is Vistelligence?": {
      answer: "Vistelligence is your intelligent visa application assistant. We provide personalized guidance for visa applications, document requirements, and expert tips.",
    },
    "What is the cost of USA visit visa for single person?": {
      answer: "The USA B1/B2 visitor visa costs $160 USD for the application fee. Other costs may apply.",
    },
    "Which documents are required to get Pakistani passport?": {
      answer: "To get a Pakistani passport, you typically need your CNIC, birth certificate, photos, and proof of address.",
    },
    "What documents are needed to apply for international scholarships?": {
      answer: "For scholarships, you often need academic transcripts, letters of recommendation, a statement of purpose, and a CV.",
    },
  };

  const suggestions = [
    "What is Vistelligence?",
    "What is the cost of USA visit visa for single person?",
    "Which document is required to get Pakistani passport?",
    "What documents are need to apply for international scholarships?",
  ];

  const getBotResponse = (question) => {
    return {
      text: visaQA[question]?.answer || "I'm here to help with visa-related questions. How can I assist you?"
    };
  };

  useEffect(() => {
    // Scroll to the latest message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    if (!text) setInput(""); // Clear input field
    setIsTyping(true);

    // Simulate bot response
      setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      const botMessage = { text: botResponse.text, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Shared input bar component
  const renderInputBar = () => (
    <div className={`w-full max-w-2xl mt-8 mx-auto flex items-center rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500' : 'bg-gray-200 focus-within:ring-2 focus-within:ring-blue-500'}`}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className={`flex-grow bg-transparent border-none focus:outline-none px-4 py-2 ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-700 placeholder-gray-500'}`}
      />
      <button
        onClick={() => handleSend()}
        disabled={!input.trim() || isTyping}
        className="bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full disabled:bg-gray-400 transition-all duration-300 hover:bg-green-600 transform hover:scale-110"
      >
        <FaPaperPlane className="text-lg" />
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <style>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .fade-in-delay-1 { animation-delay: 0.1s; animation-fill-mode: both; }
        .fade-in-delay-2 { animation-delay: 0.2s; animation-fill-mode: both; }
        .fade-in-delay-3 { animation-delay: 0.3s; animation-fill-mode: both; }
        .fade-in-delay-4 { animation-delay: 0.4s; animation-fill-mode: both; }
        .fade-in-delay-5 { animation-delay: 0.5s; animation-fill-mode: both; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .message-bubble {
            animation: fadeIn 0.3s ease-out;
        }

        .logo-breathing {
          animation: breathing 3s ease-in-out infinite;
        }

        @keyframes breathing {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 5px ${isDarkMode ? 'rgba(79, 70, 229, 0.4)' : 'rgba(129, 140, 248, 0.4)'};
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px ${isDarkMode ? 'rgba(79, 70, 229, 0.7)' : 'rgba(129, 140, 248, 0.7)'};
          }
        }
      `}</style>
      <Navbar />
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        {messages.length === 0 ? (
          // Initial screen based on the image
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl flex flex-col items-center">
            <img
                src="/images/vintageLogo.jpg"
                alt="Vistelligence Logo"
                className="w-24 h-24 mb-4 rounded-full fade-in logo-breathing"
            />
              <div className={`py-2 px-8 rounded-full mb-8 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"} fade-in fade-in-delay-1`}>
                <span className="font-semibold text-lg">
                  {userName ? `Hi, ${userName}` : 'Vistelligence'}
                </span>
          </div>
              <div className="w-full space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"} hover:scale-[1.02] fade-in fade-in-delay-${index + 2}`}
              >
                    - {suggestion}
              </button>
            ))}
              </div>
              <div className="w-full fade-in fade-in-delay-5">
                {renderInputBar()}
              </div>
            </div>
          </div>
        ) : (
          // Active chat view
          <div className="w-full max-w-2xl mx-auto flex-1">
            {messages.map((msg, index) => (
              <div key={index} className={`flex my-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-bubble`}>
                {msg.sender === 'bot' && (
                  <div className={`self-end mr-3 p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <FaRobot className={`text-xl ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
        </div>
                )}
                <div className={`p-3 rounded-lg max-w-lg shadow-md ${
                    msg.sender === 'user'
                      ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500 text-white')
                      : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100 text-black')
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
                <div className="flex justify-start my-4 message-bubble">
                    <div className={`self-end mr-3 p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <FaRobot className={`text-xl ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex items-center space-x-1">
                           <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                           <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Input bar for active chat */}
      {messages.length > 0 && (
        <footer className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
            {renderInputBar()}
        </footer>
      )}
      </div>
  );
};

export default ChatUI;
