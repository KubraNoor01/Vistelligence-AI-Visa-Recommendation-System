import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  isVisible = true 
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    setIsShowing(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (duration && isShowing) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => onClose && onClose(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isShowing, onClose]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg transform transition-all duration-300";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white border-l-4 border-green-600`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white border-l-4 border-red-600`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white border-l-4 border-yellow-600`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white border-l-4 border-blue-600`;
      default:
        return `${baseStyles} bg-gray-500 text-white border-l-4 border-gray-600`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-xl" />;
      case 'error':
        return <FaTimesCircle className="text-xl" />;
      case 'warning':
        return <FaExclamationTriangle className="text-xl" />;
      case 'info':
        return <FaInfoCircle className="text-xl" />;
      default:
        return <FaInfoCircle className="text-xl" />;
    }
  };

  if (!isShowing) return null;

  return (
    <div className={`${getToastStyles()} ${isShowing ? 'toast-enter' : 'toast-exit'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 micro-bounce"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      {duration && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-white/60 transition-all duration-300 ease-linear"
            style={{ 
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          isVisible={toast.isVisible}
        />
      ))}
    </div>
  );
};

// Toast Hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, isVisible: true };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default Toast; 