/** 
 * Version: v1.2.0 | Date: 2025-08-19
 * Purpose: Sports Management Page for Admin - CRUD operations for sports categories
 * Features: Add/edit/delete sports, icon picker, reference checking, search & filter
 * Improvements: Enhanced icon picker with 40+ sports emojis, mobile-first responsive design
 * Author: Pulse Admin System
 */
import { useState } from 'react';

interface Sport {
  id: string;
  name: string;
  icon: string;
  slug: string;
  isActive?: boolean;
  groupCount?: number;
}

interface SportsManagementProps {
  language: 'en' | 'sv';
  onBack: () => void;
}

// Glass design tokens (matching PulseApp.tsx)
const glassStyles = {
  panel: "bg-white/25 backdrop-blur-2xl border border-white/15 ring-1 ring-white/10 shadow-lg",
  card: "bg-white ring-1 ring-black/5 shadow-sm",
  header: "bg-white/30 backdrop-blur-2xl border-b border-white/10"
};

// Mock sports data with admin-relevant info
const mockSportsData: Sport[] = [
  { id: '1', name: 'Padel', icon: '🎾', slug: 'padel', isActive: true, groupCount: 12 },
  { id: '2', name: 'Football', icon: '⚽', slug: 'football', isActive: true, groupCount: 8 },
  { id: '3', name: 'Basketball', icon: '🏀', slug: 'basketball', isActive: true, groupCount: 5 },
  { id: '4', name: 'Tennis', icon: '🎾', slug: 'tennis', isActive: true, groupCount: 3 },
  { id: '5', name: 'Running', icon: '🏃', slug: 'running', isActive: true, groupCount: 15 },
  { id: '6', name: 'Swimming', icon: '🏊', slug: 'swimming', isActive: false, groupCount: 0 },
  { id: '7', name: 'Cycling', icon: '🚴', slug: 'cycling', isActive: true, groupCount: 7 },
];

export default function SportsManagement({ language, onBack }: SportsManagementProps) {
  const [sports, setSports] = useState<Sport[]>(mockSportsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '', slug: '' });

  const getText = (en: string, sv: string) => {
    return language === 'en' ? en : sv;
  };

  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sport.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive || sport.isActive;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setFormData({ name: '', icon: '', slug: '' });
    setActiveModal('add');
  };

  const openEditModal = (sport: Sport) => {
    setSelectedSport(sport);
    setFormData({ name: sport.name, icon: sport.icon, slug: sport.slug });
    setActiveModal('edit');
  };

  const openDeleteModal = (sport: Sport) => {
    setSelectedSport(sport);
    setActiveModal('delete');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.icon || !formData.slug) return;

    if (activeModal === 'add') {
      const newSport: Sport = {
        id: Date.now().toString(),
        name: formData.name,
        icon: formData.icon,
        slug: formData.slug,
        isActive: true,
        groupCount: 0
      };
      setSports(prev => [...prev, newSport]);
    } else if (activeModal === 'edit' && selectedSport) {
      setSports(prev => prev.map(sport => 
        sport.id === selectedSport.id 
          ? { ...sport, name: formData.name, icon: formData.icon, slug: formData.slug }
          : sport
      ));
    }
    closeModal();
  };

  const handleDelete = () => {
    if (selectedSport) {
      if ((selectedSport.groupCount || 0) > 0) {
        alert(getText(
          `Cannot delete ${selectedSport.name} - it has ${selectedSport.groupCount} active groups`,
          `Kan inte ta bort ${selectedSport.name} - den har ${selectedSport.groupCount} aktiva grupper`
        ));
        return;
      }
      setSports(prev => prev.filter(sport => sport.id !== selectedSport.id));
    }
    closeModal();
  };

  const toggleSportStatus = (sportId: string) => {
    setSports(prev => prev.map(sport => 
      sport.id === sportId 
        ? { ...sport, isActive: !sport.isActive }
        : sport
    ));
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSport(null);
    setFormData({ name: '', icon: '', slug: '' });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const SportFormModal = () => {
    if (!activeModal || (activeModal !== 'add' && activeModal !== 'edit')) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={closeModal}
        />
        <div className={`relative w-full max-w-md mx-4 rounded-2xl ${glassStyles.panel} p-6`}>
          <h3 className="text-xl font-semibold mb-6">
            {activeModal === 'add' 
              ? getText('Add New Sport', 'Lägg till ny sport')
              : getText('Edit Sport', 'Redigera sport')
            }
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {getText('Sport Name', 'Sportnamn')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  }));
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={getText('Enter sport name', 'Ange sportnamn')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {getText('Icon (Emoji)', 'Ikon (Emoji)')}
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-8 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                  {[
                    '⚽', '🏀', '🎾', '🏓', '🏸', '🏐', '🏈', '🥎',
                    '🏒', '🏑', '🥍', '⛳', '🏹', '🎯', '🥊', '🤼',
                    '🏃', '🚴', '🏊', '🧗', '🏂', '⛷️', '🏄', '🚣',
                    '🏋️', '🤸', '⛹️', '🤾', '🏌️', '🧘', '🤺', '🏇',
                    '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎪', '🎨'
                  ].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                      className={`p-2 text-xl hover:bg-blue-100 rounded transition-colors ${
                        formData.icon === emoji ? 'bg-blue-200 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getText('Or enter custom emoji', 'Eller ange anpassad emoji')}
                  maxLength={2}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {getText('Slug (URL identifier)', 'Slug (URL-identifierare)')}
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="basketball"
                readOnly={activeModal === 'add'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {getText('Auto-generated from name', 'Auto-genererad från namn')}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button 
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {getText('Cancel', 'Avbryt')}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.icon || !formData.slug}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeModal === 'add' 
                ? getText('Add Sport', 'Lägg till sport')
                : getText('Save Changes', 'Spara ändringar')
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = () => {
    if (activeModal !== 'delete' || !selectedSport) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={closeModal}
        />
        <div className={`relative w-full max-w-md mx-4 rounded-2xl ${glassStyles.panel} p-6`}>
          <h3 className="text-xl font-semibold mb-4 text-red-600">
            {getText('Delete Sport', 'Ta bort sport')}
          </h3>
          
          <p className="text-gray-700 mb-4">
            {getText(
              `Are you sure you want to delete "${selectedSport.name}"?`,
              `Är du säker på att du vill ta bort "${selectedSport.name}"?`
            )}
          </p>
          
          {(selectedSport.groupCount || 0) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">
                ⚠️ {getText(
                  `This sport has ${selectedSport.groupCount} active groups and cannot be deleted.`,
                  `Denna sport har ${selectedSport.groupCount} aktiva grupper och kan inte tas bort.`
                )}
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button 
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {getText('Cancel', 'Avbryt')}
            </button>
            <button 
              onClick={handleDelete}
              disabled={(selectedSport.groupCount || 0) > 0}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getText('Delete', 'Ta bort')}
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
                  {getText('Sports Management', 'Sporthantering')}
                </h1>
                <p className="text-sm text-gray-600">
                  {getText('Manage sports categories and settings', 'Hantera sportkategorier och inställningar')}
                </p>
              </div>
            </div>
            <button 
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>{getText('Add Sport', 'Lägg till sport')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className={`sticky top-[84px] z-30 ${glassStyles.header} border-t border-white/10`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getText('Search sports...', 'Sök sporter...')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur"
              />
            </div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>{getText('Show inactive', 'Visa inaktiva')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-blue-600">{sports.filter(s => s.isActive).length}</div>
            <div className="text-sm text-gray-600">{getText('Active Sports', 'Aktiva sporter')}</div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-gray-600">{sports.filter(s => !s.isActive).length}</div>
            <div className="text-sm text-gray-600">{getText('Inactive Sports', 'Inaktiva sporter')}</div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-green-600">{sports.reduce((sum, s) => sum + (s.groupCount || 0), 0)}</div>
            <div className="text-sm text-gray-600">{getText('Total Groups', 'Totala grupper')}</div>
          </div>
          <div className={`${glassStyles.card} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-purple-600">{sports.length}</div>
            <div className="text-sm text-gray-600">{getText('Total Sports', 'Totala sporter')}</div>
          </div>
        </div>

        {/* Sports Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSports.map(sport => (
            <div key={sport.id} className={`${glassStyles.card} rounded-2xl p-6 space-y-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{sport.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{sport.name}</h3>
                    <p className="text-sm text-gray-500">/{sport.slug}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleSportStatus(sport.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                      sport.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {sport.isActive 
                      ? getText('Active', 'Aktiv')
                      : getText('Inactive', 'Inaktiv')
                    }
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {getText('Active Groups', 'Aktiva grupper')}
                  </span>
                  <span className="font-medium">{sport.groupCount}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(sport)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  {getText('Edit', 'Redigera')}
                </button>
                <button
                  onClick={() => openDeleteModal(sport)}
                  disabled={(sport.groupCount || 0) > 0}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getText('Delete', 'Ta bort')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getText('No sports found', 'Inga sporter hittades')}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? getText('Try adjusting your search', 'Prova att justera din sökning')
                : getText('Start by adding your first sport', 'Börja med att lägga till din första sport')
              }
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <SportFormModal />
      <DeleteConfirmModal />
    </div>
  );
}
