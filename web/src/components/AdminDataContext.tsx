// Auto-save page state to localStorage whenever it changes
  // Ensures user returns to same view after browser refresh  // Auto-save flag reports to localStorage whenever they change
  // Ensures moderation actions persist across browser sessions/** 
/** 
 * Version: v1.0.0 | Date: 2025-08-19
 * Purpose: Shared admin data context for persistent state management
 * Features: User management, flag reporting, localStorage persistence, cross-component data sync
 * Author: Pulse Admin System
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Interface defining the structure of admin users in the system
 * Used across all admin management components for consistency
 */
interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  rating: number;
  totalRatings: number;
  flags: number;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActivity: string;
}

/**
 * Interface defining the structure of flag reports in the moderation system
 * Tracks all user reports and admin actions taken
 */
interface FlagReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportedUsername: string;
  type: 'harassment' | 'bad_sportsmanship' | 'cheating' | 'no_show' | 'inappropriate_behavior' | 'other';
  reason: string;
  details: string;
  activityId?: string;
  activityName?: string;
  date: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  severity: 'low' | 'medium' | 'high';
  reviewedBy?: string;
  reviewedAt?: string;
  actionTaken?: string;
}

/**
 * Interface for tracking admin page state across navigation and refreshes
 * Ensures user returns to the same view when reloading the app
 */
interface AdminPageState {
  currentView: string;
  activeTab: string;
  isAdmin: boolean;
  language: 'en' | 'sv';
}

/**
 * Main context interface providing all admin data management functions
 * Centralizes state management for users, flags, notifications, and page state
 */
interface AdminDataContextType {
  // Users
  users: AdminUser[];
  updateUser: (userId: string, updates: Partial<AdminUser>) => void;
  suspendUser: (userId: string, reason?: string) => void;
  activateUser: (userId: string) => void;

  // Flags
  flagReports: FlagReport[];
  updateFlagReport: (flagId: string, updates: Partial<FlagReport>) => void;
  dismissFlag: (flagId: string, reason?: string) => void;
  actionOnFlag: (flagId: string, action: string) => void;

  // Page State
  pageState: AdminPageState;
  updatePageState: (updates: Partial<AdminPageState>) => void;

  // Notifications
  notifications: {
    pendingFlags: number;
    newFeedback: number;
    pendingApprovals: number;
  };
  updateNotifications: () => void;
}

// Mock data - Initial user data for the admin system
// TODO: Replace with API calls to real backend when database is implemented
const initialUsers: AdminUser[] = [
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
    status: 'active', // Start as active, can be changed through admin actions
    joinDate: '2025-03-05',
    lastActivity: '2025-08-10'
  }
];

// Mock data - Initial flag reports for the moderation system
// TODO: Replace with API calls to real backend when database is implemented
const initialFlags: FlagReport[] = [
  {
    id: '1',
    reporterId: '4',
    reporterName: 'John Doe',
    reportedId: '1',
    reportedName: 'Emma Watson',
    reportedUsername: 'emma_watson',
    type: 'inappropriate_behavior',
    reason: 'Unsportsmanlike Conduct',
    details: 'Used inappropriate language and was aggressive during the match. Made other players uncomfortable.',
    activityId: '1',
    activityName: 'Saturday Morning Padel',
    date: '2025-07-30T12:54:00',
    status: 'pending',
    severity: 'high'
  },
  {
    id: '2',
    reporterId: '2',
    reporterName: 'Admin User',
    reportedId: '1',
    reportedName: 'Emma Watson',
    reportedUsername: 'emma_watson',
    type: 'no_show',
    reason: 'No Show',
    details: 'Did not show up to scheduled game without notice, leaving the group incomplete.',
    activityId: '2',
    activityName: 'Football Practice',
    date: '2025-07-30T12:54:00',
    status: 'reviewed',
    severity: 'medium',
    reviewedBy: 'Admin User',
    reviewedAt: '2025-08-01T10:00:00',
    actionTaken: 'Warning issued'
  },
  {
    id: '3',
    reporterId: '5',
    reporterName: 'Test User',
    reportedId: '1',
    reportedName: 'Emma Watson',
    reportedUsername: 'emma_watson',
    type: 'bad_sportsmanship',
    reason: 'Poor Sportsmanship',
    details: 'Was rude to other players during the game, refused to follow game rules.',
    activityId: '3',
    activityName: 'Basketball Pickup',
    date: '2025-07-30T12:54:00',
    status: 'pending',
    severity: 'medium'
  }
];

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

/**
 * AdminDataProvider Component
 * Provides shared state management for all admin components
 * Handles localStorage persistence and cross-component data synchronization
 * 
 * @param children - React components that need access to admin data
 */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  // Initialize users state with localStorage persistence
  // Loads saved data on app startup, falls back to mock data if none exists
  const [users, setUsers] = useState<AdminUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_admin_users');
      return saved ? JSON.parse(saved) : initialUsers;
    }
    return initialUsers;
  });

  // Initialize flag reports state with localStorage persistence
  // Loads saved flag data on app startup, falls back to mock data if none exists
  const [flagReports, setFlagReports] = useState<FlagReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_admin_flags');
      return saved ? JSON.parse(saved) : initialFlags;
    }
    return initialFlags;
  });

  // Initialize page state with localStorage persistence
  // Remembers user's last admin view, language, and mode settings
  const [pageState, setPageState] = useState<AdminPageState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_admin_page_state');
      return saved ? JSON.parse(saved) : {
        currentView: 'discover',
        activeTab: 'discover', 
        isAdmin: false,
        language: 'en'
      };
    }
    return {
      currentView: 'discover',
      activeTab: 'discover',
      isAdmin: false,
      language: 'en'
    };
  });

  // Auto-save users data to localStorage whenever it changes
  // Ensures data persistence across browser sessions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_admin_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_admin_flags', JSON.stringify(flagReports));
    }
  }, [flagReports]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_admin_page_state', JSON.stringify(pageState));
    }
  }, [pageState]);

  // Calculate real-time notification counts based on current data
  // Updates automatically when flags or users change status
  const notifications = {
    pendingFlags: flagReports.filter(f => f.status === 'pending').length,
    newFeedback: 2, // Mock value
    pendingApprovals: users.filter(u => u.status === 'pending').length
  };

  /**
   * Updates a specific user's data in the system
   * Used for changing user properties like status, rating, etc.
   * 
   * @param userId - The unique identifier of the user to update
   * @param updates - Partial user object containing fields to update
   */
  const updateUser = (userId: string, updates: Partial<AdminUser>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  /**
   * Suspends a user and updates all related flag reports
   * Automatically marks pending flags against this user as "action_taken"
   * 
   * @param userId - The unique identifier of the user to suspend
   * @param reason - Optional reason for suspension (defaults to community guidelines)
   */
  const suspendUser = (userId: string, reason = 'Community guidelines violation') => {
    // Update user status to suspended
    updateUser(userId, { status: 'suspended' });
    
    // Automatically update any pending flags for this user to "action_taken"
    // This ensures data consistency across the admin system
    setFlagReports(prev => prev.map(flag => 
      flag.reportedId === userId && flag.status === 'pending'
        ? {
            ...flag,
            status: 'action_taken',
            reviewedBy: 'Current Admin',
            reviewedAt: new Date().toISOString(),
            actionTaken: `User suspended: ${reason}`
          }
        : flag
    ));
  };

  /**
   * Reactivates a suspended user
   * Changes user status back to active
   * 
   * @param userId - The unique identifier of the user to reactivate
   */
  const activateUser = (userId: string) => {
    updateUser(userId, { status: 'active' });
  };

  /**
   * Updates a specific flag report in the system
   * Used for changing flag status, adding admin reviews, etc.
   * 
   * @param flagId - The unique identifier of the flag to update
   * @param updates - Partial flag object containing fields to update
   */
  const updateFlagReport = (flagId: string, updates: Partial<FlagReport>) => {
    setFlagReports(prev => prev.map(flag => 
      flag.id === flagId ? { ...flag, ...updates } : flag
    ));
  };

  /**
   * Dismisses a flag report without taking action
   * Marks the flag as reviewed and dismissed with admin reason
   * 
   * @param flagId - The unique identifier of the flag to dismiss
   * @param reason - Optional reason for dismissal (defaults to "No reason provided")
   */
  const dismissFlag = (flagId: string, reason = 'No reason provided') => {
    updateFlagReport(flagId, {
      status: 'dismissed',
      reviewedBy: 'Current Admin',
      reviewedAt: new Date().toISOString(),
      actionTaken: reason
    });
  };

  /**
   * Takes disciplinary action on a flag by suspending the reported user
   * Updates both the flag status and the user status simultaneously
   * 
   * @param flagId - The unique identifier of the flag to act on
   * @param action - Description of the action being taken
   */
  const actionOnFlag = (flagId: string, action: string) => {
    // Find the flag report to get user details
    const flag = flagReports.find(f => f.id === flagId);
    if (flag) {
      // Suspend the reported user with the specified action
      suspendUser(flag.reportedId, action);
      
      // Update the flag to mark action as taken
      updateFlagReport(flagId, {
        status: 'action_taken',
        reviewedBy: 'Current Admin',
        reviewedAt: new Date().toISOString(),
        actionTaken: action
      });
    }
  };

  /**
   * Updates the global page state (current view, language, admin mode)
   * Used to maintain state across navigation and browser refreshes
   * 
   * @param updates - Partial page state object containing fields to update
   */
  const updatePageState = (updates: Partial<AdminPageState>) => {
    setPageState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Manually triggers recalculation of notification counts
   * Called when external actions might affect notification state
   */
  const updateNotifications = () => {
    // Recalculate notifications if needed
    // This function can be called to refresh notification counts
  };

  // Create the context value object with all admin data and functions
  // This object is provided to all child components via React Context
  const value: AdminDataContextType = {
    users,
    updateUser,
    suspendUser,
    activateUser,
    flagReports,
    updateFlagReport,
    dismissFlag,
    actionOnFlag,
    pageState,
    updatePageState,
    notifications,
    updateNotifications
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

/**
 * Custom hook to access admin data context
 * Provides type-safe access to all admin data and functions
 * Must be used within an AdminDataProvider component
 * 
 * @returns AdminDataContextType object with all admin functions and data
 * @throws Error if used outside of AdminDataProvider
 */
export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
