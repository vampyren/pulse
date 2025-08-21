/**
 * Version: v1.0.0 | Date: 2025-08-20
 * Purpose: Toast notification component for user feedback
 * Features: Auto-dismiss, different types, smooth animations
 * Author: Pulse Admin System
 */
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-[9999] p-4 rounded-lg border-2 shadow-lg backdrop-blur-md
      transform transition-all duration-300 ease-in-out
      ${getToastStyles()}
      max-w-sm w-full sm:w-auto min-w-[300px]
    `}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{getIcon()}</span>
        <p className="flex-1 font-medium text-sm">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
