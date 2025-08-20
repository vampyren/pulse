/** Version: v0.1.0 | Purpose: TypeScript type definitions */

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: 'organizer' | 'member';
  rating: number;
  totalRatings: number;
  flags: number;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Group {
  id: string;
  title: string;
  details: string;
  sport_id: string;
  city: string;
  date_time: string;
  max_members: number;
  privacy: 'PUBLIC' | 'FRIENDS' | 'INVITE' | 'PRIVATE';
  memberCount: number;
  members: User[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface UserRating {
  userId: string;
  rating: number;
  ratedBy: string;
  activityId: string;
  createdAt: string;
}

export interface UserFlag {
  id: string;
  reportedUserId: string;
  reporterUserId: string;
  activityId: string;
  reason: 'harassment' | 'bad_sportsmanship' | 'cheating' | 'no_show' | 'inappropriate_behavior' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export type Language = 'en' | 'sv';
