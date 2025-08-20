/**
 * Version: v2.1.0 | Date: 2025-08-20
 * Purpose: Discover page - browse and filter activities with persistence
 * Features: Fixed multi-select, removed search, localStorage persistence, mobile layout
 * Author: Pulse Admin System
 */
import React, { useState, useEffect } from 'react';
import { api, type Sport, type Group } from '../services/api';

interface DiscoverPageProps {
  language: 'en' | 'sv';
  onGroupSelect: (group: Group) => void;
}

// Glass design tokens
const glassStyles = {
  panel: "bg-white/90 backdrop-blur-xl border border-white/30 shadow-xl",
  card: "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg"
};

export default function DiscoverPage({ language, onGroupSelect }: DiscoverPageProps) {
  // API state
  const [sports, setSports] = useState<Sport[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state with persistence
  const [selectedSports, setSelectedSports] = useState<string[]>(() => {
    const saved = localStorage.getItem('pulse_selected_sports');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    const saved = localStorage.getItem('pulse_selected_cities');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPrivacyTypes, setSelectedPrivacyTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('pulse_selected_privacy');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal states
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const getText = (en: string, sv: string) => language === 'en' ? en : sv;

  // Save filter state to localStorage
  useEffect(() => {
    localStorage.setItem('pulse_selected_sports', JSON.stringify(selectedSports));
  }, [selectedSports]);

  useEffect(() => {
    localStorage.setItem('pulse_selected_cities', JSON.stringify(selectedCities));
  }, [selectedCities]);

  useEffect(() => {
    localStorage.setItem('pulse_selected_privacy', JSON.stringify(selectedPrivacyTypes));
  }, [selectedPrivacyTypes]);

  // Load filtered data when filters change
  useEffect(() => {
    if (allGroups.length > 0) {
      loadGroups();
    }
  }, [selectedSports, selectedCities, selectedPrivacyTypes, allGroups]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Get unique cities from all groups (not filtered groups)
  const uniqueCities = Array.from(new Set(allGroups.map(g => g.city)));

  const loadInitialData = async () => {
    console.log('Loading data from API...');
    setLoading(true);
    setError(null);

    try {
      // Load sports
      const sportsResponse = await api.getSports();
      if (sportsResponse.data) {
        setSports(sportsResponse.data);
      } else {
        console.error('Failed to load sports:', sportsResponse.error);
      }

      // Load ALL groups first to get unique cities
      const allGroupsResponse = await api.getGroups();
      if (allGroupsResponse.data) {
        setAllGroups(allGroupsResponse.data);
      } else {
        console.error('Failed to load groups:', allGroupsResponse.error);
        setError('Failed to load activities. Please check your connection.');
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = () => {
    try {
      // Filter client-side for multiple selections
      const filtered = allGroups.filter(group => {
        const matchesSports = selectedSports.length === 0 || selectedSports.includes(group.sport_id);
        const matchesCities = selectedCities.length === 0 || selectedCities.includes(group.city);
        const matchesPrivacy = selectedPrivacyTypes.length === 0 || selectedPrivacyTypes.includes(group.privacy);
        
        return matchesSports && matchesCities && matchesPrivacy;
      });
      
      setGroups(filtered);
    } catch (err) {
      console.error('Failed to filter groups:', err);
    }
  };

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const response = await api.joinGroup(groupId);
    if (response.data) {
      console.log('Joined group successfully');
      // Reload initial data to update member count
      loadInitialData();
    } else {
      console.error('Failed to join group:', response.error);
    }
  };

  const clearAllFilters = () => {
    setSelectedSports([]);
    setSelectedCities([]);
    setSelectedPrivacyTypes([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Enhanced Filter Section */}
      <div className={`${glassStyles.panel} rounded-2xl p-6`}>
        {/* Clean Filter Buttons Row - Mobile optimized */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-4">
          {/* Clear All Button */}
          <button
            onClick={clearAllFilters}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 ${glassStyles.card} hover:shadow-md ${
              (selectedSports.length > 0 || selectedCities.length > 0 || selectedPrivacyTypes.length > 0)
                ? 'text-red-600 border border-red-200 hover:bg-red-50'
                : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span className="font-medium text-sm sm:text-base">{getText('Clear All', 'Rensa alla')}</span>
            </div>
          </button>

          {/* Privacy Filter Button */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 ${glassStyles.card} hover:shadow-md ${
              selectedPrivacyTypes.length > 0 
                ? 'text-purple-600 border border-purple-200 bg-purple-50'
                : 'text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>👁️</span>
              <span className="font-medium text-sm sm:text-base">
                {selectedPrivacyTypes.length === 0 
                  ? getText('All privacy', 'All integritet')
                  : `${selectedPrivacyTypes.length} ${getText('privacy', 'integritet')}`
                }
              </span>
            </div>
          </button>

          {/* Sports Filter Button */}
          <button
            onClick={() => setShowSportsModal(true)}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 ${glassStyles.card} hover:shadow-md ${
              selectedSports.length > 0 
                ? 'text-emerald-600 border border-emerald-200 bg-emerald-50'
                : 'text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🏃</span>
              <span className="font-medium text-sm sm:text-base">
                {selectedSports.length === 0 
                  ? getText('All activities', 'Alla aktiviteter')
                  : `${selectedSports.length} ${getText('activities', 'aktiviteter')}`
                }
              </span>
            </div>
          </button>

          {/* Cities Filter Button */}
          <button
            onClick={() => setShowCitiesModal(true)}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 ${glassStyles.card} hover:shadow-md ${
              selectedCities.length > 0 
                ? 'text-blue-600 border border-blue-200 bg-blue-50'
                : 'text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>📍</span>
              <span className="font-medium text-sm sm:text-base">
                {selectedCities.length === 0 
                  ? getText('All cities', 'Alla städer')
                  : `${selectedCities.length} ${getText('cities', 'städer')}`
                }
              </span>
            </div>
          </button>
        </div>
        
        {/* Results Count */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {getText(`${groups.length} activity${groups.length !== 1 ? 'ies' : 'y'}`, 
                     `${groups.length} aktivitet${groups.length !== 1 ? 'er' : ''}`)}
          </p>
        </div>
      </div>

      {/* Activity Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{getText('Loading activities...', 'Laddar aktiviteter...')}</p>
          </div>
        </div>
      ) : error ? (
        <div className={`${glassStyles.panel} rounded-2xl p-8 text-center`}>
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getText('Connection Error', 'Anslutningsfel')}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getText('Try Again', 'Försök igen')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const sport = sports.find(s => s.id === group.sport_id);
            const dateTime = new Date(group.date_time);
            
            return (
              <div 
                key={group.id}
                className={`${glassStyles.card} rounded-2xl p-6 space-y-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
                onClick={() => onGroupSelect(group)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {sport && <span className="text-2xl">{sport.icon || group.sport_icon}</span>}
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        group.privacy === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                        group.privacy === 'FRIENDS' ? 'bg-blue-100 text-blue-800' :
                        group.privacy === 'INVITE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {group.privacy.toLowerCase()}
                      </span>
                      {sport && <p className="text-xs text-gray-500 mt-1">{sport.name || group.sport_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-blue-600">
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
                    <span>🕐</span>
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
                      onClick={(e) => handleJoinGroup(group.id, e)}
                    >
                      {getText('Join', 'Gå med')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && groups.length === 0 && (
        <div className={`${glassStyles.panel} rounded-2xl p-8 text-center`}>
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getText('No activities found', 'Inga aktiviteter hittades')}
          </h3>
          <p className="text-gray-600">
            {getText('Try adjusting your filters', 'Prova att justera dina filter')}
          </p>
        </div>
      )}

      {/* Sports Selection Modal */}
      {showSportsModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSportsModal(false);
          }}
        >
          <div className={`${glassStyles.card} p-6 rounded-xl w-full max-w-lg`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('Select Activities', 'Välj aktiviteter')}</h3>
            
            {/* Pill-shaped options */}
            <div className="flex flex-wrap gap-2 mb-6">
              {sports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => {
                    if (selectedSports.includes(sport.id)) {
                      setSelectedSports(prev => prev.filter(id => id !== sport.id));
                    } else {
                      setSelectedSports(prev => [...prev, sport.id]);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedSports.includes(sport.id)
                      ? 'bg-emerald-500 text-white border border-emerald-500'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{sport.icon}</span>
                  <span className="text-sm font-medium">{sport.name}</span>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedSports([])}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <span>✕</span> {getText('Clear', 'Rensa')}
              </button>
              <button
                onClick={() => setShowSportsModal(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
              >
                {getText('Done', 'Klar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cities Selection Modal */}
      {showCitiesModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCitiesModal(false);
          }}
        >
          <div className={`${glassStyles.card} p-6 rounded-xl w-full max-w-lg`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('Select Cities', 'Välj städer')}</h3>
            
            {/* Pill-shaped options */}
            <div className="flex flex-wrap gap-2 mb-6">
              {uniqueCities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    if (selectedCities.includes(city)) {
                      setSelectedCities(prev => prev.filter(c => c !== city));
                    } else {
                      setSelectedCities(prev => [...prev, city]);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCities.includes(city)
                      ? 'bg-blue-500 text-white border border-blue-500'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">📍</span>
                  <span className="text-sm font-medium">{city}</span>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedCities([])}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <span>✕</span> {getText('Clear', 'Rensa')}
              </button>
              <button
                onClick={() => setShowCitiesModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {getText('Done', 'Klar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Selection Modal */}
      {showPrivacyModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrivacyModal(false);
          }}
        >
          <div className={`${glassStyles.card} p-6 rounded-xl w-full max-w-lg`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('Select Privacy Types', 'Välj integritetstyper')}</h3>
            
            {/* Pill-shaped options */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { value: 'PUBLIC', label: getText('Public', 'Offentlig'), icon: '🌐' },
                { value: 'FRIENDS', label: getText('Friends', 'Vänner'), icon: '👥' },
                { value: 'INVITE', label: getText('Invite Only', 'Endast inbjudan'), icon: '✉️' },
                { value: 'PRIVATE', label: getText('Private', 'Privat'), icon: '🔒' }
              ].map(privacy => (
                <button
                  key={privacy.value}
                  onClick={() => {
                    if (selectedPrivacyTypes.includes(privacy.value)) {
                      setSelectedPrivacyTypes(prev => prev.filter(p => p !== privacy.value));
                    } else {
                      setSelectedPrivacyTypes(prev => [...prev, privacy.value]);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedPrivacyTypes.includes(privacy.value)
                      ? 'bg-purple-500 text-white border border-purple-500'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{privacy.icon}</span>
                  <span className="text-sm font-medium">{privacy.label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPrivacyTypes([])}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <span>✕</span> {getText('Clear', 'Rensa')}
              </button>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                {getText('Done', 'Klar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
