import React from 'react';

const Message = ({ text, sender }) => {
  const isUser = sender === 'user';
  return (
    <div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
        } rounded-lg px-4 py-2 max-w-xs`}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
