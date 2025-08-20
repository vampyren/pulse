/** Version: v0.1.0 | Purpose: Utility helper functions */

export const getUserBadgeColor = (rating: number): string => {
  if (rating >= 4.5) return 'bg-green-100 text-green-800';
  if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getUserInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('');
};

export const getText = (en: string, sv: string, language: 'en' | 'sv'): string => {
  return language === 'en' ? en : sv;
};
