/**
 * Version: v1.0.0 | Date: 2025-08-20
 * Purpose: Create Activity Page - allows users to create new sports activities
 * Features: Real API integration, sport selection, skill levels, validation
 * Author: Pulse Admin System
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Lock, Globe, UserCheck, Info, ChevronDown, Search } from 'lucide-react';
import { api, type Sport, type CreateGroupRequest } from '../services/api';
import { useToast } from '../hooks/useToast';

const skillLevels = [
  { id: 'newbie', name: 'Newbie Friendly', description: 'Perfect for beginners, everyone welcome!', emoji: '🌱' },
  { id: 'weekend', name: 'Weekend Warrior', description: 'Some experience, ready to have fun', emoji: '⚡' },
  { id: 'serious', name: 'Serious Player', description: 'Experienced and focused', emoji: '🔥' },
  { id: 'elite', name: 'Elite Level', description: 'Competitive and advanced skills', emoji: '🏆' }
];

const privacyOptions = [
  { id: 'public', name: 'Public', icon: Globe, description: 'Anyone can see and join' },
  { id: 'private', name: 'Private', icon: Lock, description: 'Invitation only' },
  { id: 'friends', name: 'Friends Only', icon: UserCheck, description: 'Only your friends can join' }
];

const testLocations = [
  'Malmö Arena',
  'Ribersborgs Beach Volleyball Courts',
  'Malmö University Sports Complex, Building A',
  'Pildammsparken Recreation Area, South Field Complex near the lake'
];

interface CreateActivityPageProps {
  onBack: () => void;
  language: 'en' | 'sv';
}

export default function CreateActivityPage({ onBack, language }: CreateActivityPageProps) {
  const [formData, setFormData] = useState<CreateGroupRequest>({
    sport_id: '',
    date: '',
    time: '',
    skill_level: '',
    location: '',
    privacy: 'public',
    description: '',
    max_members: 10
  });

  const [sports, setSports] = useState<Sport[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [sportSearch, setSportSearch] = useState('');

  // Get today's date for minimum date
  const today = new Date().toISOString().split('T')[0];

  const getText = (en: string, sv: string) => language === 'en' ? en : sv;
  const { showSuccess, showError } = useToast();

  // Fetch sports from API
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await api.getSports();
        if (response.data) {
          setSports(response.data);
        } else {
          console.error('Failed to load sports:', response.error);
        }
      } catch (error) {
        console.error('Error fetching sports:', error);
      }
    };

    fetchSports();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sport_id) newErrors.sport_id = getText('Please select a sport', 'Välj en sport');
    if (!formData.date) newErrors.date = getText('Please select a date', 'Välj ett datum');
    if (!formData.time) newErrors.time = getText('Please select a time', 'Välj en tid');
    if (!formData.skill_level) newErrors.skill_level = getText('Please select a skill level', 'Välj en nivå');
    if (!formData.location.trim()) newErrors.location = getText('Please enter a location', 'Ange en plats');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {     
      localStorage.setItem('pulse_auth_token', mockToken);
      
      console.log('=== DEBUG: Creating activity ===');
      console.log('Form data:', formData);
      console.log('Auth token:', localStorage.getItem('pulse_auth_token'));
      
      const response = await api.createGroup(formData);
      
      console.log('=== DEBUG: API Response ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);

      if (response.data) {
        console.log('SUCCESS: Activity created:', response.data);
        showSuccess(getText('Activity created successfully!', 'Aktivitet skapad framgångsrikt!'));
        // Success - go back to previous page after short delay
        setTimeout(() => {
          onBack();
        }, 1000);
      } else {
        console.error('FAILED: Create activity failed');
        console.error('Error details:', response.error);
        
        if (response.error?.includes('401') || response.error?.includes('403')) {
          showError(getText('Authentication failed - please login', 'Autentisering misslyckades - logga in'));
        } else if (response.error?.includes('400')) {
          showError(getText('Invalid data - check all fields', 'Ogiltiga data - kontrollera alla fält'));
        } else {
          showError(getText(`API Error: ${response.error}`, `API-fel: ${response.error}`));
        }
      }
    } catch (error) {
      console.error('NETWORK ERROR:', error);
      showError(getText('Network error. Please check your connection.', 'Nätverksfel. Kontrollera din anslutning.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof CreateGroupRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedSport = sports.find(sport => sport.id === formData.sport_id);

  // Filter sports based on search
  const filteredSports = sports.filter(sport => 
    sport.name.toLowerCase().includes(sportSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">{getText('Back', 'Tillbaka')}</span>
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getText('Create Activity', 'Skapa aktivitet')}
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4 pb-20 max-w-2xl mx-auto">
        {/* Sport Selection - Dropdown Style */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getText('Choose Sport', 'Välj sport')} *
          </label>
          <button
            type="button"
            onClick={() => setShowSportModal(!showSportModal)}
            className={`w-full p-3 rounded-xl border-2 transition-colors text-left flex items-center justify-between ${
              errors.sport_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
            } bg-white hover:border-gray-300 ${showSportModal ? 'border-blue-500 shadow-md' : ''}`}
          >
            <div className="flex items-center gap-3">
              {selectedSport ? (
                <>
                  <span className="text-xl">{selectedSport.icon}</span>
                  <span className="font-medium text-gray-800">{selectedSport.name}</span>
                </>
              ) : (
                <span className="text-gray-500">{getText('Select a sport', 'Välj en sport')}</span>
              )}
            </div>
            <ChevronDown size={20} className={`text-gray-400 transition-transform ${showSportModal ? 'rotate-180' : ''}`} />
          </button>
          {errors.sport_id && <p className="text-red-500 text-sm mt-1">{errors.sport_id}</p>}
          
          {/* Dropdown Content */}
          {showSportModal && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={getText('Search sports...', 'Sök sporter...')}
                    value={sportSearch}
                    onChange={(e) => setSportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Sports List */}
              <div className="overflow-y-auto max-h-60">
                {filteredSports.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => {
                      updateFormData('sport_id', sport.id);
                      setShowSportModal(false);
                      setSportSearch('');
                    }}
                    className={`w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                      formData.sport_id === sport.id ? 'bg-blue-50 border-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sport.icon}</span>
                      <span className="font-medium text-gray-800">{sport.name}</span>
                      {formData.sport_id === sport.id && (
                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
                {filteredSports.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {getText(`No sports found matching "${sportSearch}"`, `Inga sporter hittades för "${sportSearch}"`)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              {getText('Date', 'Datum')} *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData('date', e.target.value)}
              min={today}
              className={`w-full p-3 rounded-xl border-2 transition-colors ${
                errors.date ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
              } bg-white focus:outline-none`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              {getText('Time', 'Tid')} *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => updateFormData('time', e.target.value)}
              className={`w-full p-3 rounded-xl border-2 transition-colors ${
                errors.time ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
              } bg-white focus:outline-none`}
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>
        </div>

        {/* Skill Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {getText('Skill Level', 'Nivå')} *
          </label>
          <div className="space-y-2">
            {skillLevels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => updateFormData('skill_level', level.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  formData.skill_level === level.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{level.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-800">{level.name}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.skill_level && <p className="text-red-500 text-sm mt-1">{errors.skill_level}</p>}
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1" />
            {getText('Location', 'Plats')} *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder={getText('Enter location or select from suggestions', 'Ange plats eller välj från förslag')}
            className={`w-full p-3 rounded-xl border-2 transition-colors ${
              errors.location ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
            } bg-white focus:outline-none`}
          />
          <div className="mt-2 text-xs text-gray-500">
            {getText('Suggestions', 'Förslag')}: {testLocations.slice(0, 2).join(', ')}, {getText('etc.', 'osv.')}
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        {/* Max Members */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users size={16} className="inline mr-1" />
            {getText('Max Participants', 'Max deltagare')}
          </label>
          <select
            value={formData.max_members}
            onChange={(e) => updateFormData('max_members', parseInt(e.target.value))}
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white focus:outline-none"
          >
            {[...Array(18)].map((_, i) => (
              <option key={i + 3} value={i + 3}>
                {i + 3} {getText('participants', 'deltagare')}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {getText('Who can join?', 'Vem kan gå med?')}
          </label>
          <div className="space-y-2">
            {privacyOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateFormData('privacy', option.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.privacy === option.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">{option.name}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Info size={16} className="inline mr-1" />
            {getText('Additional Information (Optional)', 'Ytterligare information (valfritt)')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder={getText('Any additional details about the activity, equipment needed, meeting point, etc.', 'Ytterligare detaljer om aktiviteten, nödvändig utrustning, mötesplats, osv.')}
            rows={4}
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white focus:outline-none resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {getText('Creating Activity...', 'Skapar aktivitet...')}
            </div>
          ) : (
            getText('Create Activity', 'Skapa aktivitet')
          )}
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {showSportModal && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowSportModal(false);
            setSportSearch('');
          }}
        />
      )}
    </div>
  );
}
