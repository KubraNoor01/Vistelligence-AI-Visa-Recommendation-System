import React from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordStrength = ({ password, showPassword, onTogglePassword }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 'none', score: 0, color: 'gray', text: '' };
    
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character (@$!%*?&)');
    }

    if (score === 0) return { strength: 'none', score, color: 'gray', text: 'Very Weak', feedback };
    if (score <= 2) return { strength: 'weak', score, color: 'red', text: 'Weak', feedback };
    if (score <= 3) return { strength: 'medium', score, color: 'yellow', text: 'Medium', feedback };
    if (score <= 4) return { strength: 'strong', score, color: 'blue', text: 'Strong', feedback };
    return { strength: 'very-strong', score, color: 'green', text: 'Very Strong', feedback };
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return 'from-red-500 to-red-400';
      case 'medium': return 'from-yellow-500 to-orange-400';
      case 'strong': return 'from-blue-500 to-blue-400';
      case 'very-strong': return 'from-green-500 to-emerald-400';
      default: return 'from-gray-400 to-gray-300';
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Password Strength
              </span>
              <span className={`text-sm font-bold ${
                strength.strength === 'weak' ? 'text-red-500' :
                strength.strength === 'medium' ? 'text-yellow-500' :
                strength.strength === 'strong' ? 'text-blue-500' :
                strength.strength === 'very-strong' ? 'text-green-500' :
                'text-gray-500'
              }`}>
                {strength.text}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor(strength.strength)} transition-all duration-500 ease-out`}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Toggle Password Visibility */}
          <button
            type="button"
            onClick={onTogglePassword}
            className="ml-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 micro-bounce"
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
      </div>

      {/* Requirements List */}
      {password && (
        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Requirements:
          </div>
          <div className="grid grid-cols-1 gap-1">
            {[
              { text: 'At least 8 characters', met: password.length >= 8 },
              { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
              { text: 'One lowercase letter', met: /[a-z]/.test(password) },
              { text: 'One number', met: /\d/.test(password) },
              { text: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) }
            ].map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  requirement.met 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
                <span className={`text-xs transition-colors duration-300 ${
                  requirement.met 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength; 