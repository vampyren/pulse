/** 
 * Version: v1.3.0 | Date: 2025-08-19
 * Purpose: User Management Page for Admin - User moderation and account management
 * Features: User table, suspend/activate actions, user history modal, advanced filtering
 * Improvements: Integrated user history with flag/rating tracking, real-time status updates
 * Dependencies: AdminDataContext for shared state management
 * Author: Pulse Admin System
 */
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  rating: number;
  totalRatings: number;
  flags: number;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActivity: string;
}

interface FlagEvent {
  id: string;
  type: 'harassment' | 'bad_sportsmanship' | 'cheating' | 'no_show' | 'inappropriate_behavior' | 'other';
  reason: string;
  details: string;
  reporterId: string;
  reporterName: string;
  date: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedBy?: string;
}

interface RatingEvent {
  id: string;
  rating: number;
  fromUserId: string;
  fromUserName: string;
  activityId: string;
  activityName: string;
  date: string;
}

interface UserManagementProps {
  language: 'en' | 'sv';
  onBack: () => void;
}

// Glass design tokens
const glassStyles = {
  panel: "bg-white/25 backdrop-blur-2xl border border-white/15 ring-1 ring-white/10 shadow-lg",
  card: "bg-white ring-1 ring-black/5 shadow-sm",
  header: "bg-white/30 backdrop-blur-2xl border-b border-white/10"
};

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emma Watson',
    username: 'emma_watson',
    email: 'emma@example.com',
    role: 'user',
    rating: 4.2,
    totalRatings: 15,
    flags: 3,
    status: 'active',
    joinDate: '2025-01-15',
    lastActivity: '2025-08-18'
  },
  {
    id: '2',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    rating: 5.0,
    totalRatings: 2,
    flags: 0,
    status: 'active',
    joinDate: '2025-01-01',
    lastActivity: '2025-08-19'
  },
  {
    id: '3',
    name: 'Alice Smith',
    username: 'alice_smith',
    email: 'alice@example.com',
    role: 'user',
    rating: 4.8,
    totalRatings: 24,
    flags: 0,
    status: 'active',
    joinDate: '2025-02-10',
    lastActivity: '2025-08-17'
  },
  {
    id: '4',
    name: 'John Doe',
    username: 'john_doe',
    email: 'john.doe@example.com',
    role: 'user',
    rating: 3.1,
    totalRatings: 8,
    flags: 1,
    status: 'suspended',
    joinDate: '2025-03-05',
    lastActivity: '2025-08-10'
  }
];

// Mock flag events
const mockFlags: FlagEvent[] = [
  {
    id: '1',
    type: 'inappropriate_behavior',
    reason: 'Unsportsmanlike Conduct',
    details: 'Used inappropriate language and was aggressive',
    reporterId: '4',
    reporterName: 'John Doe',
    date: '2025-07-30T12:54:00',
    status: 'pending'
  },
  {
    id: '2',
    type: 'no_show',
    reason: 'No Show',
    details: 'Did not show up to scheduled game without notice',
    reporterId: '2',
    reporterName: 'Admin User',
    date: '2025-07-30T12:54:00',
    status: 'reviewed'
  },
  {
    id: '3',
    type: 'harassment',
    reason: 'Inappropriate Behavior',
    details: 'Was rude to other players during the game',
    reporterId: '5',
    reporterName: 'Test User',
    date: '2025-07-30T12:54:00',
    status: 'pending'
  }
];

// Mock rating events
const mockRatings: RatingEvent[] = [
  {
    id: '1',
    rating: 4,
    fromUserId: '3',
    fromUserName: 'Alice Smith',
    activityId: '1',
    activityName: 'Saturday Padel',
    date: '2025-08-15T10:30:00'
  },
  {
    id: '2',
    rating: 3,
    fromUserId: '4',
    fromUserName: 'John Doe',
    activityId: '2',
    activityName: 'Football Training',
    date: '2025-08-10T18:00:00'
  }
];

export default function UserManagement({ language, onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [flagFilter, setFlagFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'flags' | 'ratings'>('flags');

  const getText = (en: string, sv: string) => {
    return language === 'en' ? en : sv;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesFlags = flagFilter === 'all' || 
                        (flagFilter === 'flagged' && user.flags > 0) ||
                        (flagFilter === 'clean' && user.flags === 0);
    
    return matchesSearch && matchesStatus && matchesRole && matchesFlags;
  });

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
  };

  const openUserHistory = (user: User) => {
    setSelectedUser(user);
    setShowUserHistory(true);
  };

  const closeUserHistory = () => {
    setShowUserHistory(false);
    setSelectedUser(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getFlagColor = (flags: number) => {
    if (flags === 0) return 'text-green-600';
    if (flags <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // User History Modal
  const UserHistoryModal = () => {
    if (!showUserHistory || !selectedUser) return null;

    const userFlags = mockFlags.filter(flag => flag.reporterId === selectedUser.id);
    const userRatings = mockRatings.filter(rating => rating.fromUserId === selectedUser.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeUserHistory}
        />
        <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl ${glassStyles.panel} overflow-hidden`}>
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-600">{getText('User History', 'Användarhistorik')}</p>
                </div>
              </div>
              <button 
                onClick={closeUserHistory}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/10">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getFlagColor(selectedUser.flags)}`}>
                {selectedUser.flags}
              </div>
              <div className="text-sm text-gray-600">{getText('Total Flags', 'Totala flaggor')}</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getFlagColor(userFlags.filter(f => f.status === 'pending').length)}`}>
                {userFlags.filter(f => f.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">{getText('Active Flags', 'Aktiva flaggor')}</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getRatingColor(selectedUser.rating)}`}>
                {selectedUser.rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">{getText('Avg Rating', 'Genomsnittligt betyg')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{selectedUser.totalRatings}</div>
              <div className="text-sm text-gray-600">{getText('Total Ratings', 'Totala betyg')}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveHistoryTab('flags')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeHistoryTab === 'flags'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚩 {getText('Flag History', 'Flagghistorik')} ({userFlags.length})
            </button>
            <button
              onClick={() => setActiveHistoryTab('ratings')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeHistoryTab === 'ratings'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⭐ {getText('Rating History', 'Betygshistorik')} ({userRatings.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeHistoryTab === 'flags' && (
              <div className="space-y-4">
                {userFlags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {getText('No flag history', 'Ingen flagghistorik')}
                  </div>
                ) : (
                  userFlags.map(flag => (
                    <div key={flag.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{flag.reason}</h4>
                          <p className="text-sm text-gray-600">
                            {getText('Reported by', 'Rapporterad av')}: {flag.reporterName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            flag.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            flag.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {flag.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(flag.date)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">"{flag.details}"</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeHistoryTab === 'ratings' && (
              <div className="space-y-4">
                {userRatings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {getText('No rating history', 'Ingen betygshistorik')}
                  </div>
                ) : (
                  userRatings.map(rating => (
                    <div key={rating.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{rating.activityName}</h4>
                          <p className="text-sm text-gray-600">
                            {getText('Rated by', 'Betygsatt av')}: {rating.fromUserName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span 
                                key={star}
                                className={`text-lg ${star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(rating.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/20">
            <button
              onClick={closeUserHistory}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {getText('Close', 'Stäng')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className={`sticky top-0 z-40 ${glassStyles.header}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <span className="text-xl">←</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getText('User Management', 'Användarhantering')}
                </h1>
                <p className="text-sm text-gray-600">
                  {getText('Manage users, roles, and moderation', 'Hantera användare, roller och moderering')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className={`sticky top-[84px] z-30 ${glassStyles.header} border-t border-white/10`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={getText('Search users...', 'Sök användare...')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            >
              <option value="all">{getText('All Status', 'Alla statusar')}</option>
              <option value="active">{getText('Active', 'Aktiv')}</option>
              <option value="suspended">{getText('Suspended', 'Avstängd')}</option>
              <option value="pending">{getText('Pending', 'Väntande')}</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            >
              <option value="all">{getText('All Roles', 'Alla roller')}</option>
              <option value="admin">{getText('Admin', 'Admin')}</option>
              <option value="user">{getText('User', 'Användare')}</option>
            </select>

            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            >
              <option value="all">{getText('All Users', 'Alla användare')}</option>
              <option value="flagged">{getText('Flagged Users', 'Flaggade användare')}</option>
              <option value="clean">{getText('Clean Users', 'Rena användare')}</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center justify-center">
              {filteredUsers.length} {getText('users found', 'användare hittade')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-sm text-gray-600">{getText('Active Users', 'Aktiva användare')}</div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</div>
            <div className="text-sm text-gray-600">{getText('Suspended', 'Avstängda')}</div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.flags > 0).length}</div>
            <div className="text-sm text-gray-600">{getText('Flagged Users', 'Flaggade användare')}</div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</div>
            <div className="text-sm text-gray-600">{getText('Admins', 'Admins')}</div>
          </div>
        </div>

        {/* User Table */}
        <div className={`${glassStyles.card} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('User', 'Användare')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('Email', 'E-post')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('Rating', 'Betyg')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('Flags', 'Flaggor')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('Role', 'Roll')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('Status', 'Status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getText('Actions', 'Åtgärder')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getRatingColor(user.rating)}`}>
                        ⭐ {user.rating.toFixed(1)} ({user.totalRatings})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getFlagColor(user.flags)}`}>
                        {user.flags > 0 ? `🚩 ${user.flags}` : '✅ 0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? getText('Admin', 'Admin') : getText('User', 'Användare')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? getText('Active', 'Aktiv') :
                         user.status === 'suspended' ? getText('Suspended', 'Avstängd') :
                         getText('Pending', 'Väntande')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openUserHistory(user)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        {getText('History', 'Historik')}
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-2 py-1 rounded transition-colors ${
                            user.status === 'suspended'
                              ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                        >
                          {user.status === 'suspended' 
                            ? getText('Activate', 'Aktivera')
                            : getText('Suspend', 'Stäng av')
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getText('No users found', 'Inga användare hittades')}
              </h3>
              <p className="text-gray-600">
                {getText('Try adjusting your filters', 'Prova att justera dina filter')}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* User History Modal */}
      <UserHistoryModal />
    </div>
  );
}
