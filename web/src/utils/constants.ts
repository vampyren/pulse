/** Version: v0.1.0 | Purpose: App constants and design tokens */

export const glassStyles = {
  panel: "bg-white/25 backdrop-blur-2xl border border-white/15 ring-1 ring-white/10 shadow-lg",
  card: "bg-white ring-1 ring-black/5 shadow-sm",
  header: "bg-white/30 backdrop-blur-2xl border-b border-white/10"
};

export const privacyColors = {
  PUBLIC: 'bg-green-100 text-green-800',
  FRIENDS: 'bg-blue-100 text-blue-800', 
  INVITE: 'bg-purple-100 text-purple-800',
  PRIVATE: 'bg-gray-100 text-gray-800'
};

export const flagReasons = [
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'bad_sportsmanship', label: 'Bad Sportsmanship' },
  { value: 'cheating', label: 'Cheating or Unfair Play' },
  { value: 'no_show', label: 'No Show' },
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'other', label: 'Other' }
];
