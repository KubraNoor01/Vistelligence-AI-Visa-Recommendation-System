import React from 'react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold text-red-600">
        This User is Blocked and No Access the Site
      </h1>
      <p className="text-gray-600 mt-2">Please contact support for more details.</p>
    </div>
  );
};

export default NotFound;
