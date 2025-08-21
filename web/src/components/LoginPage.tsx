/**
 * Version: v1.0.0 | Date: 2025-08-20
 * Purpose: Simple login page for Pulse authentication
 * Features: Login form, validation, token storage
 * Author: Pulse Admin System
 */
import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

interface LoginPageProps {
  onLoginSuccess: () => void;
  language: 'en' | 'sv';
}

export default function LoginPage({ onLoginSuccess, language }: LoginPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const getText = (en: string, sv: string) => language === 'en' ? en : sv;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      showError(getText('Please enter username and password', 'Ange användarnamn och lösenord'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login(formData);
      
      if (response.data) {
        showSuccess(getText('Login successful!', 'Inloggning lyckades!'));
        onLoginSuccess();
      } else {
        showError(getText('Invalid username or password', 'Ogiltigt användarnamn eller lösenord'));
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(getText('Network error. Please try again.', 'Nätverksfel. Försök igen.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login buttons for testing
  const quickLogin = async (username: string, password: string) => {
    setFormData({ username, password });
    setIsLoading(true);

    try {
      const response = await api.login({ username, password });
      
      if (response.data) {
        showSuccess(getText('Login successful!', 'Inloggning lyckades!'));
        onLoginSuccess();
      } else {
        showError(getText('Login failed', 'Inloggning misslyckades'));
      }
    } catch (error) {
      showError(getText('Login failed', 'Inloggning misslyckades'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Pulse
          </h1>
          <p className="text-gray-600">{getText('Sign in to continue', 'Logga in för att fortsätta')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Username or Email', 'Användarnamn eller e-post')}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white focus:outline-none transition-colors"
              placeholder={getText('Enter username or email', 'Ange användarnamn eller e-post')}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Password', 'Lösenord')}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white focus:outline-none transition-colors"
              placeholder={getText('Enter password', 'Ange lösenord')}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {getText('Signing in...', 'Loggar in...')}
              </div>
            ) : (
              getText('Sign In', 'Logga in')
            )}
          </button>
        </form>

        {/* Quick Login for Testing */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4 text-center">
            {getText('Quick login for testing:', 'Snabbinloggning för test:')}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin', 'password123')}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
            >
              🛡️ {getText('Login as Admin', 'Logga in som Admin')} (admin/password123)
            </button>
            <button
              onClick={() => quickLogin('john_doe', 'password123')}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
            >
              👤 {getText('Login as User', 'Logga in som Användare')} (john_doe/password123)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
