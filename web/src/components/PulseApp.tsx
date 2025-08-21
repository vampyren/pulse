/** 
 * Version: v2.4.0 | Date: 2025-08-20
 * Purpose: Main PulseApp with clean architecture and page-based navigation including create activity
 * Features: Page routing, API integration, admin system, improved structure, create activity
 * Author: Pulse Admin System
 */
import React, { useState, useEffect } from 'react';
import { api, type Sport, type Group, type User, type FlagReport } from '../services/api';
import DiscoverPage from '../pages/DiscoverPage';
import CreateActivityPage from '../pages/CreateActivityPage';
import SportsManagement from './SportsManagement';
import UserManagement from './UserManagement';
import FlagManagement from './FlagManagement';
import { ToastProvider } from '../hooks/useToast';
import LoginPage from './LoginPage';
import MePage from '../pages/MePage';

// Glass design tokens
const glassStyles = {
  panel: "bg-white/90 backdrop-blur-xl border border-white/30 shadow-xl",
  card: "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg",
  header: "bg-white/95 backdrop-blur-xl border-b border-gray-200/30",
  menu: "bg-white/95 backdrop-blur-2xl border-t border-white/20 shadow-lg"
};

export default function PulseApp() {
  // Persistent state management
  const [activeTab, setActiveTab] = useState(() => 
    localStorage.getItem('pulse_active_tab') || 'discover'
  );
  const [language, setLanguage] = useState<'en' | 'sv'>(() => 
    (localStorage.getItem('pulse_language') as 'en' | 'sv') || 'en'
  );
  const [isAdmin, setIsAdmin] = useState(() => 
    localStorage.getItem('pulse_is_admin') === 'true'
  );
  const [currentView, setCurrentView] = useState<'discover' | 'groups' | 'chat' | 'book' | 'me' | 'admin-sports' | 'admin-users' | 'admin-flags' | 'admin-dashboard' | 'group-detail' | 'create-activity'>(() => 
    (localStorage.getItem('pulse_current_view') as any) || 'discover'
  );
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('pulse_auth_token');
  });

  // App state
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Rating and flagging modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');

  // Save state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('pulse_active_tab', activeTab);
    localStorage.setItem('pulse_language', language);
    localStorage.setItem('pulse_is_admin', isAdmin.toString());
    localStorage.setItem('pulse_current_view', currentView);
  }, [activeTab, language, isAdmin, currentView]);

  const getText = (en: string, sv: string) => language === 'en' ? en : sv;

  // Navigation functions
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'sv' : 'en');

 const navigateToAdmin = () => {
    console.log('navigateToAdmin called!');
    setIsAdmin(true);
    setCurrentView('admin-dashboard');
    setActiveTab('admin-dashboard');
    console.log('Admin state should now be:', true);
  };

 const toggleAdminMode = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setCurrentView('discover');
      setActiveTab('discover');
    } else {
      setIsAdmin(true);
      setCurrentView('admin-dashboard');
      setActiveTab('admin-dashboard');
    }
  };

  const navigateToPage = (page: string) => {
    setCurrentView(page as any);
    setActiveTab(page);
  };

  // Authentication functions
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.clearToken();
    setIsAuthenticated(false);
    setCurrentView('discover');
    setActiveTab('discover');
  };

  // Admin navigation
  const goToSports = () => navigateToPage('admin-sports');
  const goToUsers = () => navigateToPage('admin-users');
  const goToFlags = () => navigateToPage('admin-flags');
  const goToAdmin = () => navigateToPage('admin-dashboard');
  const handleBackToAdmin = () => navigateToPage('admin-dashboard');

  // Group detail navigation
  const openGroupDetail = async (group: Group) => {
    // Load full group details from API
    const response = await api.getGroup(group.id);
    if (response.data) {
      setSelectedGroup(response.data);
    } else {
      setSelectedGroup(group);
    }
    setCurrentView('group-detail');
  };

  const closeGroupDetail = () => {
    setSelectedGroup(null);
    setCurrentView('discover');
  };

  // Create activity navigation
  const openCreateActivity = () => {
    setCurrentView('create-activity');
  };

  const closeCreateActivity = () => {
    setCurrentView('discover');
    // Reload activities to show the new one
    // The DiscoverPage will handle this automatically
  };

  // Rating and flagging functions
  const openRatingModal = (user: User) => {
    setSelectedUser(user);
    setUserRating(user.userRating || 0);
    setShowRatingModal(true);
  };

  const openFlagModal = (user: User) => {
    setSelectedUser(user);
    setShowFlagModal(true);
  };

  const handleRateUser = async () => {
    if (!selectedUser || userRating === 0 || !selectedGroup) return;
    
    const response = await api.rateUser(selectedUser.id, userRating, selectedGroup.id);
    if (response.data) {
      console.log('Rating submitted successfully');
      // Reload group details
      const updatedGroup = await api.getGroup(selectedGroup.id);
      if (updatedGroup.data) {
        setSelectedGroup(updatedGroup.data);
      }
    } else {
      console.error('Failed to submit rating:', response.error);
    }
    
    setShowRatingModal(false);
    setUserRating(0);
    setSelectedUser(null);
  };

  const handleFlagUser = async () => {
    if (!selectedUser || !flagReason || !selectedGroup) return;
    
    const response = await api.flagUser(
      selectedUser.id, 
      flagReason, 
      flagReason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      flagDetails, 
      selectedGroup.id
    );
    
    if (response.data) {
      console.log('Flag submitted successfully');
    } else {
      console.error('Failed to submit flag:', response.error);
    }
    
    setShowFlagModal(false);
    setFlagReason('');
    setFlagDetails('');
    setSelectedUser(null);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const flagReasons = [
    { value: 'harassment', label: getText('Harassment', 'Trakasserier') },
    { value: 'bad_sportsmanship', label: getText('Bad Sportsmanship', 'Dåligt sportsmanskap') },
    { value: 'cheating', label: getText('Cheating', 'Fusk') },
    { value: 'no_show', label: getText('No Show', 'Uteblev') },
    { value: 'inappropriate_behavior', label: getText('Inappropriate Behavior', 'Olämpligt beteende') },
    { value: 'other', label: getText('Other', 'Annat') }
  ];

  // Page Components
  const AdminDashboard = () => (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className={`${glassStyles.panel} rounded-2xl p-6`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Pulse</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{getText('Admin Dashboard', 'Administratörspanel')}</h2>
          <p className="text-gray-600">{getText('Manage your sports community', 'Hantera din sportgemenskap')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={goToSports}
            className={`${glassStyles.card} p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left group`}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⚽</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{getText('Manage Sports', 'Hantera sporter')}</h3>
            <p className="text-gray-600 text-sm">{getText('Add, edit and organize sports categories', 'Lägg till, redigera och organisera sportkategorier')}</p>
          </button>
          
          <button
            onClick={goToUsers}
            className={`${glassStyles.card} p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left group`}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">👥</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{getText('User Management', 'Användarhantering')}</h3>
            <p className="text-gray-600 text-sm">{getText('Monitor users and handle moderation', 'Övervaka användare och hantera moderering')}</p>
          </button>
          
          <button
            onClick={goToFlags}
            className={`${glassStyles.card} p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left group`}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🚩</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{getText('Flag Management', 'Flagghantering')}</h3>
            <p className="text-gray-600 text-sm">{getText('Review reports and take moderation actions', 'Granska rapporter och vidta modereringsåtgärder')}</p>
          </button>
        </div>
      </div>
    </div>
  );

  // Placeholder pages for other menu items
  const GroupsPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className={`${glassStyles.panel} rounded-2xl p-8 text-center`}>
        <div className="text-4xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('My Groups', 'Mina grupper')}</h2>
        <p className="text-gray-600">{getText('View and manage your joined activities', 'Visa och hantera dina anslutna aktiviteter')}</p>
        <div className="mt-4 text-sm text-gray-500">
          {getText('Coming soon...', 'Kommer snart...')}
        </div>
      </div>
    </div>
  );

  const ChatPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className={`${glassStyles.panel} rounded-2xl p-8 text-center`}>
        <div className="text-4xl mb-4">💬</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Messages', 'Meddelanden')}</h2>
        <p className="text-gray-600">{getText('Chat with other members', 'Chatta med andra medlemmar')}</p>
        <div className="mt-4 text-sm text-gray-500">
          {getText('Coming soon...', 'Kommer snart...')}
        </div>
      </div>
    </div>
  );

  const BookPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className={`${glassStyles.panel} rounded-2xl p-8 text-center`}>
        <div className="text-4xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('Book Activities', 'Boka aktiviteter')}</h2>
        <p className="text-gray-600">{getText('Schedule and organize new activities', 'Schemalägg och organisera nya aktiviteter')}</p>
        <div className="mt-4 text-sm text-gray-500">
          {getText('Coming soon...', 'Kommer snart...')}
        </div>
      </div>
    </div>
  );

  const MePageComponent = () => (
    <MePage 
      language={language} 
      isAdmin={isAdmin} 
      onLogout={handleLogout}
      onToggleAdmin={toggleAdminMode}
      onNavigateToAdmin={navigateToAdmin}
    />
  );

  // Group Detail Component
  const GroupDetailPage = () => {
    if (!selectedGroup) return null;
    
    const dateTime = new Date(selectedGroup.date_time);

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <button 
          onClick={closeGroupDetail}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <span>←</span>
          <span>{getText('Back to Discover', 'Tillbaka till upptäck')}</span>
        </button>
        
        <div className={`${glassStyles.panel} rounded-2xl p-6`}>
          <div className="flex items-start space-x-4 mb-6">
            <span className="text-3xl">{selectedGroup.sport_icon}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedGroup.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📍 {selectedGroup.city}</span>
                <span>📅 {dateTime.toLocaleDateString()}</span>
                <span>🕒 {dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span>👤 {selectedGroup.memberCount}/{selectedGroup.max_members}</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">{selectedGroup.details}</p>
          
          {/* Members section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getText('Members', 'Medlemmar')} ({selectedGroup.members.length})
            </h3>
            <div className="space-y-3">
              {selectedGroup.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{member.name}</span>
                        {member.role === 'organizer' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                            {getText('Organizer', 'Organisatör')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRatingColor(member.rating)}`}>
                          ⭐ {member.rating.toFixed(1)} ({member.totalRatings} {getText('ratings', 'betyg')})
                        </span>
                        {member.flags > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
                            🚩 {member.flags}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rate and flag buttons */}
                  {member.role !== 'organizer' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openRatingModal(member)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                      >
                        {member.userRating ? '⭐' : getText('Rate', 'Betygsätt')}
                      </button>
                      <button
                        onClick={() => openFlagModal(member)}
                        className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200"
                      >
                        {getText('Flag', 'Flagga')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center pt-6 border-t border-gray-200 mt-6">
            <button 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              onClick={async () => {
                const response = await api.joinGroup(selectedGroup.id);
                if (response.data) {
                  console.log('Joined group successfully');
                  // Reload group details
                  const updatedGroup = await api.getGroup(selectedGroup.id);
                  if (updatedGroup.data) {
                    setSelectedGroup(updatedGroup.data);
                  }
                } else {
                  console.error('Failed to join group:', response.error);
                }
              }}
            >
              {getText('Join Activity', 'Gå med i aktivitet')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render current view
  let mainContent;
  
  switch (currentView) {
    case 'discover':
      mainContent = <DiscoverPage language={language} onGroupSelect={openGroupDetail} onCreateActivity={openCreateActivity} />;
      break;
    case 'groups':
      mainContent = <GroupsPage />;
      break;
    case 'chat':
      mainContent = <ChatPage />;
      break;
    case 'book':
      mainContent = <BookPage />;
      break;
    case 'me':
      mainContent = <MePageComponent />;
      break;
    case 'admin-dashboard':
      mainContent = <AdminDashboard />;
      break;
    case 'admin-sports':
      mainContent = <SportsManagement language={language} onBack={handleBackToAdmin} />;
      break;
    case 'admin-users':
      mainContent = <UserManagement language={language} onBack={handleBackToAdmin} />;
      break;
    case 'admin-flags':
      mainContent = <FlagManagement language={language} onBack={handleBackToAdmin} />;
      break;
    case 'group-detail':
      mainContent = <GroupDetailPage />;
      break;
    case 'create-activity':
      mainContent = <CreateActivityPage language={language} onBack={closeCreateActivity} />;
      break;
    default:
      mainContent = <DiscoverPage language={language} onGroupSelect={openGroupDetail} onCreateActivity={openCreateActivity} />;
  }

return (
    <ToastProvider>
      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} language={language} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* HEADER */}
        <header className={`sticky top-0 z-40 ${glassStyles.header}`}>
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pulse
              </h1>
              <p className="text-sm text-gray-600">
                {isAdmin ? getText('Admin Panel', 'Administratörspanel') : getText('Find your next activity', 'Hitta din nästa aktivitet')}
              </p>
              </div>
              <div className="flex items-center space-x-3">
               <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <span className="text-lg">🌐</span>
                <span className="text-lg">{language === 'en' ? '🇺🇸' : '🇸🇪'}</span>
              </button>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="pb-20">
          {mainContent}
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className={`fixed bottom-0 left-0 right-0 ${glassStyles.menu} border-t border-gray-200`}>
          <div className="flex items-center justify-around py-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigateToPage('admin-dashboard')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'admin-dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">📊</span>
                  <span className="text-xs font-medium">Dashboard</span>
                </button>
                <button
                  onClick={() => navigateToPage('admin-sports')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'admin-sports' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">⚽</span>
                  <span className="text-xs font-medium">Sports</span>
                </button>
                <button
                  onClick={() => navigateToPage('admin-users')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'admin-users' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">👥</span>
                  <span className="text-xs font-medium">Users</span>
                </button>
                <button
                  onClick={() => navigateToPage('admin-flags')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'admin-flags' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">🚩</span>
                  <span className="text-xs font-medium">Flags</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigateToPage('discover')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'discover' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">🔍</span>
                  <span className="text-xs font-medium">Discover</span>
                </button>
                <button 
                  onClick={() => navigateToPage('groups')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'groups' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">👥</span>
                  <span className="text-xs font-medium">Groups</span>
                </button>
                <button 
                  onClick={() => navigateToPage('chat')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'chat' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">💬</span>
                  <span className="text-xs font-medium">Chat</span>
                </button>
                <button 
                  onClick={() => navigateToPage('book')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'book' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">📅</span>
                  <span className="text-xs font-medium">Book</span>
                </button>
                <button 
                  onClick={() => navigateToPage('me')}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'me' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">👤</span>
                  <span className="text-xs font-medium">Me</span>
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Rating Modal */}
        {showRatingModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${glassStyles.card} p-6 rounded-xl w-full max-w-sm`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('Rate User', 'Betygsätt användare')}</h3>
              <p className="text-gray-600 mb-4">{selectedUser.name}</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Rating', 'Betyg')}</label>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-3xl transition-all duration-200 ${
                        star <= (hoverRating || userRating) 
                          ? 'text-yellow-400 scale-110' 
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {userRating} star{userRating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setUserRating(0);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  {getText('Cancel', 'Avbryt')}
                </button>
                <button
                  onClick={handleRateUser}
                  disabled={userRating === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {getText('Submit', 'Skicka')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flag Modal */}
        {showFlagModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${glassStyles.card} p-6 rounded-xl w-full max-w-sm`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('Flag User', 'Flagga användare')}</h3>
              <p className="text-gray-600 mb-4">{selectedUser.name}</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Reason', 'Anledning')}</label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  {flagReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {flagReason === 'other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getText('Details', 'Detaljer')}</label>
                  <textarea
                    value={flagDetails}
                    onChange={(e) => setFlagDetails(e.target.value)}
                    placeholder="Please provide details..."
                    className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFlagModal(false);
                    setFlagReason('');
                    setFlagDetails('');
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  {getText('Cancel', 'Avbryt')}
                </button>
                <button
                  onClick={handleFlagUser}
                  disabled={!flagReason || (flagReason === 'other' && !flagDetails.trim())}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {getText('Submit', 'Skicka')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    </ToastProvider>
  );
}
