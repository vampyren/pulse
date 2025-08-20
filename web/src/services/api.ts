/**
 * Version: v1.0.0 | Date: 2025-08-20
 * Purpose: API service layer for Pulse app - connects frontend to backend
 * Features: Authentication, groups, sports, users, ratings, flags
 * Author: Pulse Admin System
 */

const API_BASE_URL = 'http://136.244.101.169:4010/api/v2';

// Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    rating: number;
    totalRatings: number;
    flags: number;
  };
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  isActive?: boolean;
  groupCount?: number;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  role?: 'organizer' | 'member' | 'admin' | 'user';
  rating: number;
  totalRatings: number;
  flags: number;
  status?: 'active' | 'suspended' | 'pending';
  userRating?: number;
}

export interface Group {
  id: string;
  title: string;
  details: string;
  sport_id: string;
  sport_name?: string;
  sport_icon?: string;
  city: string;
  date_time: string;
  privacy: 'PUBLIC' | 'FRIENDS' | 'INVITE' | 'PRIVATE';
  memberCount: number;
  max_members: number;
  members: User[];
  organizer_name?: string;
}

export interface FlagReport {
  id: string;
  reportedUser?: string;
  reportedUsername?: string;
  reported_name?: string;
  reporter?: string;
  reporter_name?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  severity: 'low' | 'medium' | 'high';
  date?: string;
  created_at?: string;
  details: string;
  activity?: string;
  activity_name?: string;
  type: string;
}

export interface CreateSportRequest {
  name: string;
  icon: string;
  slug?: string;
}

export interface RateUserRequest {
  rating: number;
  groupId: string;
}

export interface FlagUserRequest {
  type: string;
  reason: string;
  details: string;
  groupId: string;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('pulse_auth_token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('pulse_auth_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('pulse_auth_token');
  }

  // Generic request method
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making API request to:', url);  // Add this line  
  
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.request('/health');
  }

  // Sports endpoints
  async getSports(): Promise<ApiResponse<Sport[]>> {
    return this.request('/sports');
  }

  async createSport(sportData: CreateSportRequest): Promise<ApiResponse<Sport>> {
    return this.request('/sports', {
      method: 'POST',
      body: JSON.stringify(sportData),
    });
  }

  // Groups endpoints
  async getGroups(filters?: {
    sport?: string;
    city?: string;
    privacy?: string;
    search?: string;
  }): Promise<ApiResponse<Group[]>> {
    const params = new URLSearchParams();
    
    if (filters?.sport && filters.sport !== 'all') {
      params.append('sport', filters.sport);
    }
    if (filters?.city && filters.city !== 'all') {
      params.append('city', filters.city);
    }
    if (filters?.privacy && filters.privacy !== 'all') {
      params.append('privacy', filters.privacy);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/groups?${queryString}` : '/groups';
    
    return this.request(endpoint);
  }

  async getGroup(id: string): Promise<ApiResponse<Group>> {
    return this.request(`/groups/${id}`);
  }

  async joinGroup(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/groups/${id}/join`, {
      method: 'POST',
    });
  }

  // User interaction endpoints
  async rateUser(userId: string, ratingData: RateUserRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/users/${userId}/rate`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async flagUser(userId: string, flagData: FlagUserRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/users/${userId}/flag`, {
      method: 'POST',
      body: JSON.stringify(flagData),
    });
  }

  // Admin endpoints
  async getUsers(filters?: {
    status?: string;
    role?: string;
    search?: string;
  }): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    return this.request(endpoint);
  }

  async getFlags(filters?: {
    status?: string;
  }): Promise<ApiResponse<FlagReport[]>> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/flags?${queryString}` : '/admin/flags';
    
    return this.request(endpoint);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience functions
export const api = {
  // Auth
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  register: (userData: { name: string; username: string; email: string; password: string }) => 
    apiClient.register(userData),
  logout: () => apiClient.clearToken(),
  
  // Health
  health: () => apiClient.healthCheck(),
  
  // Sports
  getSports: () => apiClient.getSports(),
  createSport: (sportData: CreateSportRequest) => apiClient.createSport(sportData),
  
  // Groups
  getGroups: (filters?: { sport?: string; city?: string; privacy?: string; search?: string }) => 
    apiClient.getGroups(filters),
  getGroup: (id: string) => apiClient.getGroup(id),
  joinGroup: (id: string) => apiClient.joinGroup(id),
  
  // Users
  rateUser: (userId: string, rating: number, groupId: string) => 
    apiClient.rateUser(userId, { rating, groupId }),
  flagUser: (userId: string, type: string, reason: string, details: string, groupId: string) => 
    apiClient.flagUser(userId, { type, reason, details, groupId }),
  
  // Admin
  getUsers: (filters?: { status?: string; role?: string; search?: string }) => 
    apiClient.getUsers(filters),
  getFlags: (filters?: { status?: string }) => apiClient.getFlags(filters),
  
  // Utils
  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
};

export default api;
