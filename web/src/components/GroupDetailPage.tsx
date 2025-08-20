/** 
 * Version: v2.0.0 | Date: 2025-08-20
 * Purpose: Group detail page with member management and join functionality
 * Features: Group info display, member list, rating system, flag system, join/leave actions
 * Author: Pulse Admin System
 */
import React, { useState } from 'react';

// Type definitions
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

interface Sport {
  id: string;
  name: string;
  icon: string;
}

interface GroupDetailPageProps {
  group: Group;
  sport?: Sport;
  language: 'en' | 'sv';
  onBack: () => void;
}

// Glass design tokens
const glassStyles = {
  panel: "bg-white/90 backdrop-blur-xl border border-white/30 shadow-xl",
  card: "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg"
};

export default function GroupDetailPage({ group, sport, language, onBack }: GroupDetailPageProps) {
  const [showRatingModal, setShowRatingModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [showFlagModal, setShowFlagModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [rating, setRating] = useState(0);
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');

  const getText = (en: string, sv: string) => language === 'en' ? en : sv;

  const handleRateUser = (user: User) => {
    setShowRatingModal({ isOpen: true, user });
    setRating(0);
  };

  const handleFlagUser = (user: User) => {
    setShowFlagModal({ isOpen: true, user });
    setFlagReason('');
    setFlagDetails('');
  };

  const submitRating = () => {
    if (rating > 0 && showRatingModal.user) {
      console.log('Rating submitted:', { userId: showRatingModal.user.id, rating });
      setShowRatingModal({ isOpen: false, user: null });
      setRating(0);
    }
  };

  const submitFlag = () => {
    if (flagReason && showFlagModal.user) {
      console.log('Flag submitted:', { 
        userId: showFlagModal.user.id, 
        reason: flagReason, 
        details: flagDetails 
      });
      setShowFlagModal({ isOpen: false, user: null });
      setFlagReason('');
      setFlagDetails('');
    }
  };

  const flagReasons = [
    'harassment',
    'bad_sportsmanship', 
    'cheating',
    'no_show',
    'inappropriate_behavior',
    'other'
  ];

  const getReasonText = (reason: string) => {
    const reasons = {
      harassment: getText('Harassment', 'Trakasserier'),
      bad_sportsmanship: getText('Bad Sportsmanship', 'Dåligt sportsmannaskap'),
      cheating: getText('Cheating', 'Fusk'),
      no_show: getText('No Show', 'Uteblev'),
      inappropriate_behavior: getText('Inappropriate Behavior', 'Olämpligt beteende'),
      other: getText('Other', 'Annat')
    };
    return reasons[reason as keyof typeof reasons] || reason;
  };

  const dateTime = new Date(group.date_time);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <span>←</span>
        <span>{getText('Back to Discover', 'Tillbaka till Upptäck')}</span>
      </button>

      <div className={`${glassStyles.panel} rounded-2xl p-6`}>
        <div className="flex items-start space-x-4 mb-6">
          {sport && <span className="text-3xl">{sport.icon}</span>}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{group.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>📍 {group.city}</span>
              <span>📅 {dateTime.toLocaleDateString()}</span>
              <span>🕒 {dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span>👤 {group.memberCount}/{group.max_members}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6 leading-relaxed">{group.details}</p>
        
        {/* Members Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getText('Members', 'Medlemmar')} ({group.members.length})
          </h3>
          
          <div className="space-y-3">
            {group.members.map((member) => (
              <div key={member.id} className={`${glassStyles.card} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-yellow-600">⭐ {member.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({member.totalRatings} {getText('ratings', 'betyg')})</span>
                        {member.role === 'organizer' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {getText('Organizer', 'Organisatör')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRateUser(member)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm transition-colors"
                    >
                      {getText('Rate', 'Betygsätt')}
                    </button>
                    <button
                      onClick={() => handleFlagUser(member)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm transition-colors"
                    >
                      {getText('Flag', 'Flagga')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Join Button */}
        <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
          <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            {getText('Join Activity', 'Gå med i aktivitet')}
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal.isOpen && showRatingModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRatingModal({ isOpen: false, user: null })} />
          <div className={`relative w-full max-w-md rounded-2xl ${glassStyles.panel} p-6`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {getText('Rate User', 'Betygsätt användare')}
            </h3>
            
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-4">
                {getText(`Rate ${showRatingModal.user.name}`, `Betygsätt ${showRatingModal.user.name}`)}
              </p>
              
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowRatingModal({ isOpen: false, user: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getText('Cancel', 'Avbryt')}
              </button>
              <button 
                onClick={submitRating}
                disabled={rating === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getText('Submit Rating', 'Skicka betyg')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal.isOpen && showFlagModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFlagModal({ isOpen: false, user: null })} />
          <div className={`relative w-full max-w-md rounded-2xl ${glassStyles.panel} p-6`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {getText('Report User', 'Rapportera användare')}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-4">
                {getText(`Report ${showFlagModal.user.name}`, `Rapportera ${showFlagModal.user.name}`)}
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('Reason', 'Anledning')}
                  </label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{getText('Select reason', 'Välj anledning')}</option>
                    {flagReasons.map(reason => (
                      <option key={reason} value={reason}>
                        {getReasonText(reason)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('Details (optional)', 'Detaljer (valfritt)')}
                  </label>
                  <textarea
                    value={flagDetails}
                    onChange={(e) => setFlagDetails(e.target.value)}
                    placeholder={getText('Describe what happened...', 'Beskriv vad som hände...')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowFlagModal({ isOpen: false, user: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getText('Cancel', 'Avbryt')}
              </button>
              <button 
                onClick={submitFlag}
                disabled={!flagReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getText('Submit Report', 'Skicka rapport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
