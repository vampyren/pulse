/**
 * Version: v1.1.0 | Date: 2025-08-20
 * Purpose: Me/Profile page with user options and logout
 * Features: Profile info, settings, logout, comprehensive menu options
 * Author: Pulse Admin System
 */
import React from 'react';
import { User, Settings, HelpCircle, Shield, Star, Flag, LogOut, Bell, Lock, MessageCircle } from 'lucide-react';

interface MePageProps {
  language: 'en' | 'sv';
  isAdmin: boolean;
  onLogout: () => void;
  onToggleAdmin: () => void;
  onNavigateToAdmin: () => void;
}

// Glass design tokens
const glassStyles = {
  panel: "bg-white/90 backdrop-blur-xl border border-white/30 shadow-xl",
  card: "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg"
};

export default function MePage({ language, isAdmin, onLogout, onToggleAdmin, onNavigateToAdmin }: MePageProps) {
  const getText = (en: string, sv: string) => language === 'en' ? en : sv;
   // ADD THESE DEBUG LINES:
  console.log('=== MePage Debug ===');
  console.log('isAdmin:', isAdmin);
  console.log('onNavigateToAdmin type:', typeof onNavigateToAdmin);
  console.log('onNavigateToAdmin function:', onNavigateToAdmin);

  const menuItems = [
    {
      icon: User,
      title: getText('Edit Profile', 'Redigera profil'),
      description: getText('Update your personal information', 'Uppdatera din personliga information'),
      onClick: () => console.log('Edit profile clicked'),
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Star,
      title: getText('My Activities', 'Mina aktiviteter'),
      description: getText('View your joined and created activities', 'Visa dina anslutna och skapade aktiviteter'),
      onClick: () => console.log('My activities clicked'),
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Flag,
      title: getText('My Ratings & Reviews', 'Mina betyg & recensioner'),
      description: getText('View your ratings and reviews', 'Visa dina betyg och recensioner'),
      onClick: () => console.log('My ratings clicked'),
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: Settings,
      title: getText('Preferences', 'Inställningar'),
      description: getText('Notifications, privacy, and app settings', 'Notifikationer, integritet och appinställningar'),
      onClick: () => console.log('Settings clicked'),
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: HelpCircle,
      title: getText('Help & Support', 'Hjälp & support'),
      description: getText('FAQ, contact support, report issues', 'FAQ, kontakta support, rapportera problem'),
      onClick: () => console.log('Help clicked'),
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className={`${glassStyles.panel} rounded-2xl p-6`}>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            JD
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
            <p className="text-gray-600">john_doe@example.com</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm text-gray-600">4.2 rating • 23 activities</span>
            </div>
          </div>
        </div>

        {/* Admin Toggle */}
        {isAdmin && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {getText('Admin Mode Active', 'Administratörsläge aktivt')}
                </span>
                <p className="text-xs text-blue-600">
                  {getText('You have admin privileges', 'Du har administratörsbehörigheter')}
                </p>
              </div>
              <button
                onClick={onToggleAdmin}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {getText('Switch to User', 'Växla till användare')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={item.onClick}
              className={`${glassStyles.card} w-full p-4 rounded-xl text-left hover:shadow-lg transition-all duration-200 group`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </button>
          );
        })}

        {/* Additional Options */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => console.log('Notifications clicked')}
            className={`${glassStyles.card} w-full p-4 rounded-xl text-left hover:shadow-lg transition-all duration-200 group mb-3`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg text-orange-600 bg-orange-50 group-hover:scale-110 transition-transform duration-200">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {getText('Notifications', 'Notifikationer')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getText('Manage your notification preferences', 'Hantera dina notifikationsinställningar')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">→</div>
            </div>
          </button>

          <button
            onClick={() => console.log('Privacy clicked')}
            className={`${glassStyles.card} w-full p-4 rounded-xl text-left hover:shadow-lg transition-all duration-200 group mb-3`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg text-gray-600 bg-gray-50 group-hover:scale-110 transition-transform duration-200">
                <Lock size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {getText('Privacy & Security', 'Integritet & säkerhet')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getText('Control your privacy settings', 'Kontrollera dina integritetsinställningar')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">→</div>
            </div>
          </button>

          <button
            onClick={() => console.log('Feedback clicked')}
            className={`${glassStyles.card} w-full p-4 rounded-xl text-left hover:shadow-lg transition-all duration-200 group mb-3`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg text-teal-600 bg-teal-50 group-hover:scale-110 transition-transform duration-200">
                <MessageCircle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {getText('Send Feedback', 'Skicka feedback')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getText('Help us improve the app', 'Hjälp oss förbättra appen')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">→</div>
            </div>
          </button>
        </div>

       {/* Admin Mode Toggle (for non-admin users) */}
        {!isAdmin && (
          <button
            onClick={() => {
              console.log('Admin Panel button clicked!');
              onNavigateToAdmin();
            }}
            className={`${glassStyles.card} w-full p-4 rounded-xl text-left hover:shadow-lg transition-all duration-200 group`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg text-purple-600 bg-purple-50 group-hover:scale-110 transition-transform duration-200">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {getText('Admin Panel', 'Administratörspanel')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getText('Access admin features', 'Få tillgång till adminsfunktioner')}
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                →
              </div>
            </div>
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`${glassStyles.card} w-full p-4 rounded-xl text-left hover:shadow-lg transition-all duration-200 group border-red-200 hover:border-red-300`}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg text-red-600 bg-red-50 group-hover:scale-110 transition-transform duration-200">
              <LogOut size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 group-hover:text-red-700 transition-colors">
                {getText('Logout', 'Logga ut')}
              </h3>
              <p className="text-sm text-gray-600">
                {getText('Sign out of your account', 'Logga ut från ditt konto')}
              </p>
            </div>
            <div className="text-red-400 group-hover:text-red-600 transition-colors">
              →
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
