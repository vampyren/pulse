/** 
 * Version: v2.0.0 | Date: 2025-08-20
 * Purpose: Discover page with activity browsing, filters, and search
 * Features: Multi-filter system, activity cards, search functionality, glass design
 * Author: Pulse Admin System
 */
import React, { useState } from 'react';

// Type definitions
interface Sport {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  isActive?: boolean;
  groupCount?: number;
}

interface User {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  flags: number;
  role?: 'organizer' | 'member' | 'admin' | 'user';
  username?: string;
  email?: string;
  status?: 'active' | 'suspended' | 'pending';
}

interface Group {
  id: string;
  title: string;
  details: string;
  sport_id: string;
  city: string;
  date_time: string;
  privacy: 'PUBLIC' | 'FRIENDS' | 'INVITE' | 'PRIVATE';
  memberCount: number;
  max_members: number;
  members: User[];
}

interface DiscoverPageProps {
  language: 'en' | 'sv';
  onGroupSelect: (group: Group) => void;
}

// Mock data - TODO: Replace with API calls
const mockSports: Sport[] = [
  { id: '1', name: 'Football', icon: '⚽', slug: 'football', isActive: true, groupCount: 8 },
  { id: '2', name: 'Basketball', icon: '🏀', slug: 'basketball', isActive: true, groupCount: 5 },
  { id: '3', name: 'Tennis', icon: '🎾', slug: 'tennis', isActive: true, groupCount: 3 },
  { id: '4', name: 'Swimming', icon: '🏊', slug: 'swimming', isActive: true, groupCount: 2 },
  { id: '5', name: 'Running', icon: '🏃', slug: 'running', isActive: true, groupCount: 15 },
  { id: '6', name: 'Padel', icon: '🎾', slug: 'padel', isActive: true, groupCount: 12 },
  { id: '7', name: 'Cycling', icon: '🚴', slug: 'cycling', isActive: true, groupCount: 7 },
  { id: '8', name: 'Volleyball', icon: '🏐', slug: 'volleyball', isActive: true, groupCount: 4 }
];

const mockGroups: Group[] = [
  {
    id: '1',
    title: 'Weekend Football Match',
    details: 'Join us for a friendly football match this weekend at the local park. Perfect for players of all skill levels!',
    sport_id: '1',
    city: 'Malmö',
    date_time: '2025-08-23T14:00:00',
    privacy: 'PUBLIC',
    memberCount: 8,
    max_members: 22,
    members: [
      { id: '1', name: 'John Doe', rating: 4.5, totalRatings: 12, flags: 0, role: 'organizer' },
      { id: '2', name: 'Jane Smith', rating: 4.2, totalRatings: 8, flags: 0, role: 'member' }
    ]
  },
  {
    id: '2',
    title: 'Basketball Training Session',
    details: 'Weekly basketball training session for intermediate players. Come improve your skills!',
    sport_id: '2',
    city: 'Stockholm',
    date_time: '2025-08-24T18:00:00',
    privacy: 'PUBLIC',
    memberCount: 12,
    max_members: 16,
    members: [
      { id: '3', name: 'Mike Johnson', rating: 4.7, totalRatings: 20, flags: 0, role: 'organizer' }
    ]
  },
  {
    id: '3',
    title: 'Tennis Tournament',
    details: 'Monthly tennis tournament with prizes for winners. All levels welcome!',
    sport_id: '3',
    city: 'Göteborg',
    date_time: '2025-08-25T10:00:00',
    privacy: 'PUBLIC',
    memberCount: 6,
    max_members: 8,
    members: []
  },
  {
    id: '4',
    title: 'Morning Swimming',
    details: 'Early morning swimming session at the local pool. Great way to start the day!',
    sport_id: '4',
    city: 'Malmö',
    date_time: '2025-08-26T07:00:00',
    privacy: 'FRIENDS',
    memberCount: 4,
    max_members: 6,
    members: []
  },
  {
    id: '5',
    title: 'Running Club Meet',
    details: 'Weekly running club meeting. We run 5-10km depending on the group pace.',
    sport_id: '5',
    city: 'Stockholm',
    date_time: '2025-08-27T19:00:00',
    privacy: 'PUBLIC',
    memberCount: 15,
    max_members: 20,
    members: []
  },
  {
    id: '6',
    title: 'Padel Championship',
    details: 'Competitive padel matches with experienced players. Tournament format.',
    sport_id: '6',
    city: 'Malmö',
    date_time: '2025-08-28T16:00:00',
    privacy: 'INVITE',
    memberCount: 8,
    max_members: 16,
    members: []
  },
  {
    id: '7',
    title: 'Cycling Adventure',
    details: 'Long distance cycling tour through the countryside. Bring your own bike!',
    sport_id: '7',
    city: 'Uppsala',
    date_time: '2025-08-29T09:00:00',
    privacy: 'PUBLIC',
    memberCount: 6,
    max_members: 12,
    members: []
  },
  {
    id: '8',
    title: 'Beach Volleyball',
    details: 'Fun beach volleyball session by the coast. Perfect summer activity!',
    sport_id: '8',
    city: 'Göteborg',
    date_time: '2025-08-30T15:00:00',
    privacy: 'PUBLIC',
    memberCount: 8,
    max_members: 12,
    members: []
  }
];

// Glass design tokens
const glassStyles = {
  panel: "bg-white/90 backdrop-blur-xl border border-white/30 shadow-xl",
  card: "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg"
};

export default function DiscoverPage({ language, onGroupSelect }: DiscoverPageProps) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all');

  const getText = (en: string, sv: string) => language === 'en' ? en : sv;

  // Get unique cities and filter groups
  const uniqueCities = ['all', ...Array.from(new Set(mockGroups.map(g => g.city)))];
  
  const filteredGroups = mockGroups.filter(group => {
    const sport = mockSports.find(s => s.id === group.sport_id);
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sport && sport.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = selectedSport === 'all' || group.sport_id === selectedSport;
    const matchesCity = selectedCity === 'all' || group.city === selectedCity;
    const matchesPrivacy = selectedPrivacy === 'all' || group.privacy === selectedPrivacy;
    
    return matchesSearch && matchesSport && matchesCity && matchesPrivacy;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Filter Section */}
      <div className={`${glassStyles.panel} rounded-2xl p-6`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{getText('Find Activities', 'Hitta aktiviteter')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Search', 'Sök')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={getText('Search activities...', 'Sök aktiviteter...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Sport', 'Sport')}
            </label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{getText('All Sports', 'Alla sporter')}</option>
              {mockSports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {sport.icon} {sport.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('City', 'Stad')}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueCities.map(city => (
                <option key={city} value={city}>
                  {city === 'all' ? getText('All Cities', 'Alla städer') : city}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Privacy', 'Integritet')}
            </label>
            <select
              value={selectedPrivacy}
              onChange={(e) => setSelectedPrivacy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{getText('All Types', 'Alla typer')}</option>
              <option value="PUBLIC">{getText('Public', 'Offentlig')}</option>
              <option value="FRIENDS">{getText('Friends', 'Vänner')}</option>
              <option value="INVITE">{getText('Invite Only', 'Endast inbjudan')}</option>
              <option value="PRIVATE">{getText('Private', 'Privat')}</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {getText(`Showing ${filteredGroups.length} of ${mockGroups.length} activities`, 
                     `Visar ${filteredGroups.length} av ${mockGroups.length} aktiviteter`)}
          </p>
          
          {(searchTerm || selectedSport !== 'all' || selectedCity !== 'all' || selectedPrivacy !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSport('all');
                setSelectedCity('all');
                setSelectedPrivacy('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {getText('Clear filters', 'Rensa filter')}
            </button>
          )}
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => {
          const sport = mockSports.find(s => s.id === group.sport_id);
          const dateTime = new Date(group.date_time);
          
          return (
            <div 
              key={group.id}
              className={`${glassStyles.card} rounded-2xl p-6 space-y-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
              onClick={() => onGroupSelect(group)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {sport && <span className="text-2xl">{sport.icon}</span>}
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.privacy === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                      group.privacy === 'FRIENDS' ? 'bg-blue-100 text-blue-800' :
                      group.privacy === 'INVITE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {group.privacy.toLowerCase()}
                    </span>
                    {sport && <p className="text-xs text-gray-500 mt-1">{sport.name}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <span>👤</span>
                  <span>{group.memberCount}/{group.max_members}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{group.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{group.details}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <span>📍</span>
                    <span>{group.city}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <span>📅</span>
                    <span>{dateTime.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <span>🕒</span>
                  <span>{dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((member, idx) => (
                      <div 
                        key={member.id} 
                        className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    ))}
                    {group.memberCount > 3 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                        +{group.memberCount - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle join action
                    }}
                  >
                    {getText('Join', 'Gå med')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className={`${glassStyles.panel} rounded-2xl p-8 text-center`}>
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getText('No activities found', 'Inga aktiviteter hittades')}
          </h3>
          <p className="text-gray-600">
            {getText('Try adjusting your search or filters', 'Prova att justera din sökning eller filter')}
          </p>
        </div>
      )}
    </div>
  );
}
