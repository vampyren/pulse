/** 
 * Version: v1.5.0 | Date: 2025-08-19
 * Purpose: Complete Flag Management Page with all features
 * Features: Flag review, dismiss/suspend actions, search/filters, detail modal, type-specific icons
 * Author: Pulse Admin System
 */
import { useState } from 'react';

interface FlagManagementProps {
  language: 'en' | 'sv';
  onBack: () => void;
}

// Glass design tokens
const glassStyles = {
  panel: "bg-white/25 backdrop-blur-2xl border border-white/15 ring-1 ring-white/10 shadow-lg",
  card: "bg-white ring-1 ring-black/5 shadow-sm",
  header: "bg-white/30 backdrop-blur-2xl border-b border-white/10"
};

// Enhanced mock data with more details
const mockFlags = [
  {
    id: '1',
    reportedUser: 'Emma Watson',
    reportedUsername: 'emma_watson',
    reporter: 'John Doe',
    reason: 'Unsportsmanlike Conduct',
    status: 'pending',
    severity: 'high',
    date: '2025-07-30',
    details: 'Used inappropriate language and was aggressive during the match. Made other players uncomfortable.',
    activity: 'Saturday Morning Padel'
  },
  {
    id: '2',
    reportedUser: 'John Doe', 
    reportedUsername: 'john_doe',
    reporter: 'Carol Davis',
    reason: 'Harassment',
    status: 'pending',
    severity: 'high',
    date: '2025-08-15',
    details: 'Sent inappropriate messages after the game ended. Made me feel unsafe.',
    activity: 'Saturday Morning Padel'
  },
  {
    id: '3',
    reportedUser: 'Bob Smith',
    reportedUsername: 'bob_smith',
    reporter: 'Emma Watson',
    reason: 'Cheating',
    status: 'dismissed',
    severity: 'low',
    date: '2025-08-10',
    details: 'Consistently called false scores and disputed legitimate points.',
    activity: 'Saturday Morning Padel'
  },
  {
    id: '4',
    reportedUser: 'Emma Watson',
    reportedUsername: 'emma_watson',
    reporter: 'Admin User',
    reason: 'No Show',
    status: 'reviewed',
    severity: 'medium',
    date: '2025-08-01',
    details: 'Did not show up to scheduled game without notice, leaving the group incomplete.',
    activity: 'Football Practice'
  },
  {
    id: '5',
    reportedUser: 'Mike Johnson',
    reportedUsername: 'mike_j',
    reporter: 'Sarah Wilson',
    reason: 'Inappropriate Behavior',
    status: 'pending',
    severity: 'medium',
    date: '2025-08-18',
    details: 'Made sexist comments and created an uncomfortable environment for female participants.',
    activity: 'Tennis Tournament'
  }
];

export default function FlagManagement({ language, onBack }: FlagManagementProps) {
  // State management
  const [flags] = useState(mockFlags);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; flagId: string; type: 'dismiss' | 'suspend' } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [showFlagDetail, setShowFlagDetail] = useState(false);

  // Filter flags based on search and filters
  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.activity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || flag.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Helper functions
  const getText = (en: string, sv: string) => {
    return language === 'en' ? en : sv;
  };

  const openFlagDetail = (flag: any) => {
    setSelectedFlag(flag);
    setShowFlagDetail(true);
  };

  const closeFlagDetail = () => {
    setShowFlagDetail(false);
    setSelectedFlag(null);
  };

  const handleDismiss = (flagId: string) => {
    setActionModal({ isOpen: true, flagId, type: 'dismiss' });
  };

  const handleSuspend = (flagId: string) => {
    setActionModal({ isOpen: true, flagId, type: 'suspend' });
  };

  const confirmAction = () => {
    if (actionModal) {
      if (actionModal.type === 'dismiss') {
        console.log('Dismissing flag:', actionModal.flagId, 'Reason:', actionReason || 'No reason provided');
      } else {
        console.log('Suspending user for flag:', actionModal.flagId);
      }
    }
    setActionModal(null);
    setActionReason('');
  };

  const cancelAction = () => {
    setActionModal(null);
    setActionReason('');
  };

  const getTypeIcon = (reason: string) => {
    if (reason.toLowerCase().includes('harassment')) return '🚨';
    if (reason.toLowerCase().includes('cheat')) return '🎭';
    if (reason.toLowerCase().includes('no show')) return '👻';
    if (reason.toLowerCase().includes('unsport')) return '😠';
    if (reason.toLowerCase().includes('inappropriate')) return '⚠️';
    return '📋';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                  {getText('Flag Management', 'Flagghantering')}
                </h1>
                <p className="text-sm text-gray-600">
                  {getText('Review and moderate user reports', 'Granska och moderera användarrapporter')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Filters */}
      <div className={`sticky top-[84px] z-30 ${glassStyles.header} border-t border-white/10`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={getText('Search flags...', 'Sök flaggor...')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            >
              <option value="all">{getText('All Status', 'Alla statusar')}</option>
              <option value="pending">{getText('Pending', 'Väntande')}</option>
              <option value="reviewed">{getText('Reviewed', 'Granskad')}</option>
              <option value="dismissed">{getText('Dismissed', 'Avfärdad')}</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
            >
              <option value="all">{getText('All Severity', 'Alla allvarlighetsgrader')}</option>
              <option value="high">{getText('High', 'Hög')}</option>
              <option value="medium">{getText('Medium', 'Medel')}</option>
              <option value="low">{getText('Low', 'Låg')}</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center justify-center">
              {filteredFlags.length} {getText('flags found', 'flaggor hittade')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-yellow-600">
              {flags.filter(f => f.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">
              {getText('Pending Flags', 'Väntande flaggor')}
            </div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-red-600">
              {flags.filter(f => f.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-600">
              {getText('High Priority', 'Hög prioritet')}
            </div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-blue-600">
              {flags.filter(f => f.status === 'reviewed').length}
            </div>
            <div className="text-sm text-gray-600">
              {getText('Reviewed', 'Granskade')}
            </div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-purple-600">{flags.length}</div>
            <div className="text-sm text-gray-600">
              {getText('Total Flags', 'Totala flaggor')}
            </div>
          </div>
        </div>

        {/* Enhanced Flag List */}
        <div className="space-y-4">
          {filteredFlags.map((flag) => (
            <div key={flag.id} className={`${glassStyles.card} rounded-2xl p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(flag.reason)}</span>
                    <h3 className="font-semibold text-lg">{flag.reason}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                      {flag.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">
                        {getText('Reported User', 'Rapporterad användare')}:
                      </span>
                      <br />
                      <span className="font-medium">{flag.reportedUser}</span>
                      <br />
                      <span className="text-xs text-gray-500">@{flag.reportedUsername}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {getText('Reported by', 'Rapporterad av')}:
                      </span>
                      <br />
                      <span className="font-medium">{flag.reporter}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {getText('Activity', 'Aktivitet')}:
                      </span>
                      <br />
                      <span className="font-medium">{flag.activity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {getText('Date', 'Datum')}:
                      </span>
                      <br />
                      <span className="font-medium">{flag.date}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-2">"{flag.details}"</p>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(flag.status)}`}>
                    {flag.status === 'pending' ? getText('PENDING', 'VÄNTANDE') :
                     flag.status === 'dismissed' ? getText('DISMISSED', 'AVFÄRDAD') :
                     getText('REVIEWED', 'GRANSKAD')}
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => openFlagDetail(flag)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      {getText('Details', 'Detaljer')}
                    </button>
                    
                    {flag.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleDismiss(flag.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          {getText('Dismiss', 'Avfärda')}
                        </button>
                        <button 
                          onClick={() => handleSuspend(flag.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          {getText('Suspend', 'Stäng av')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFlags.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' ? '🔍' : '🎉'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getText('No flags found', 'Inga flaggor hittades')}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                ? getText('Try adjusting your search or filters', 'Prova att justera din sökning eller filter')
                : getText('All clear! No pending flags to review.', 'Allt klart! Inga väntande flaggor att granska.')
              }
            </p>
          </div>
        )}
      </main>

      {/* Flag Detail Modal */}
      {showFlagDetail && selectedFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeFlagDetail}
          />
          <div className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl ${glassStyles.panel} overflow-hidden`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getTypeIcon(selectedFlag.reason)}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedFlag.reason}</h2>
                    <p className="text-gray-600">{getText('Flag Report Details', 'Flaggrapportdetaljer')}</p>
                  </div>
                </div>
                <button 
                  onClick={closeFlagDetail}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{getText('Reported User', 'Rapporterad användare')}</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedFlag.reportedUser.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{selectedFlag.reportedUser}</p>
                    <p className="text-sm text-gray-600">@{selectedFlag.reportedUsername}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{getText('Reported By', 'Rapporterad av')}</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedFlag.reporter.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{selectedFlag.reporter}</p>
                    <p className="text-sm text-gray-600">{selectedFlag.date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">{getText('Activity', 'Aktivitet')}</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-2">{selectedFlag.activity}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">{getText('Severity', 'Allvarlighetsgrad')}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedFlag.severity)}`}>
                    {selectedFlag.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{getText('Detailed Report', 'Detaljerad rapport')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{selectedFlag.details}"</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {selectedFlag.status === 'pending' && (
              <div className="p-6 border-t border-white/20">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      closeFlagDetail();
                      handleDismiss(selectedFlag.id);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {getText('Dismiss Flag', 'Avfärda flagga')}
                  </button>
                  <button
                    onClick={() => {
                      closeFlagDetail();
                      handleSuspend(selectedFlag.id);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {getText('Suspend User', 'Stäng av användare')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelAction}
          />
          <div className={`relative w-full max-w-md rounded-2xl ${glassStyles.panel} p-6`}>
            <h3 className="text-xl font-semibold mb-4">
              {actionModal.type === 'dismiss' 
                ? getText('Dismiss Flag', 'Avfärda flagga')
                : getText('Suspend User', 'Stäng av användare')
              }
            </h3>
            
            {actionModal.type === 'dismiss' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('Reason for dismissal (optional)', 'Anledning till avfärdande (valfritt)')}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={getText('e.g., Insufficient evidence...', 't.ex., Otillräckliga bevis...')}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            ) : (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <div>
                    <p className="text-red-800 font-medium mb-1">
                      {getText('Confirm User Suspension', 'Bekräfta användaravstängning')}
                    </p>
                    <p className="text-red-700 text-sm">
                      {getText('This will suspend the user from all activities.', 'Detta kommer att stänga av användaren från alla aktiviteter.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={cancelAction}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getText('Cancel', 'Avbryt')}
              </button>
              <button 
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  actionModal.type === 'dismiss' 
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionModal.type === 'dismiss' 
                  ? getText('Dismiss Flag', 'Avfärda flagga')
                  : getText('Suspend User', 'Stäng av användare')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
