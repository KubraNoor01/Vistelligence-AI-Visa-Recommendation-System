import React, { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai'; // Delete icon
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaBan,
  FaCheckCircle,
  FaFlag,
} from "react-icons/fa";

function VerifyPage() {
  // List of emails
  const navigate = useNavigate();

  const emailList = [
    'wahabnadeem311@gmail.com',
    'Zeeshan@gmail.com',
    'Tahirgmail.com',
  ];

  const handleDelete = (email) => {
    alert(`Email ${email} Deleted`);
  };

  const handleBackClick = () => {
    navigate("/shery");
  };

  return (
    <>
    <nav className="hidden sm:flex justify-between items-center w-full p-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg">
              {/* Logo on the Left */}
              <Link to="/" className="text-2xl font-bold flex items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img
                    src="images/vintageLogo.jpg"
                    alt="Vintage Logo"
                    className="object-cover w-full h-full"
                  />
                </div>
              </Link>
    
    
              <ul className="flex gap-6 items-center justify-center flex-1">
                <li>
                  <Link to="/report" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                    <FaFlag />
                    <span>Reported Post</span>
                  </Link>
                </li>
                <li>
                  <Link to="/verify" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                    <FaCheckCircle />
                    <span>Verify</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notverify" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                    <FaBan />
                    <span>Block</span>
                  </Link>
                </li>
              </ul>
            </nav>
    
            {/* Mobile Navbar */}
            <nav className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg sm:hidden z-50">
              <ul className="flex justify-around items-center p-2">
                <li>
                  <Link to="/report" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                    <FaFlag />
                    <span>Reported Post</span>
                  </Link>
                </li>
                <li>
                  <Link to="/verify" className="flex flex-col items-center text-sm hover:text-gray-300 transition-colors">
                    <FaCheckCircle className="text-2xl" />
                    <span>Verify</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notverify" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                    <FaBan />
                    <span>Block</span>
                  </Link>
                </li>
              </ul>
              <Link to="/chatbot" className="fixed bottom-[100px] right-5 sm:hidden w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50">
                <FaRobot className="text-white text-2xl" />
              </Link>
            </nav>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 font-lexend">Verified Emails</h1>
        
        {/* List of emails with delete icons */}
        <div className="space-y-3">
          {emailList.map((email, index) => (
            <div key={index} className="flex justify-between items-center border-b py-2">
              <div className='flex flex-col text-left'>
                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-lexend">{email}</h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">This email has been verified.</p>
              </div>
              <button
                onClick={() => handleDelete(email)}
                className="text-red-500 hover:text-red-700 text-lg sm:text-xl md:text-2xl lg:text-3xl"
                title="Delete Email"
              >
                <AiOutlineDelete />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

export default VerifyPage;
