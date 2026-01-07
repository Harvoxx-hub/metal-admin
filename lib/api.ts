// API configuration and client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-62f2a.up.railway.app/api/v1';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken') || null;
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminToken', token);
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
};

// Base fetch function with auth headers
const apiFetch = async (endpoint: string, options: RequestInit = {}, skipAuthRedirect = false): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized - redirect to login (but not for auth endpoints like login/signup)
  if (response.status === 401 && !skipAuthRedirect) {
    removeAuthToken();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  return response;
};

// API client functions
export const api = {
  // Admin Auth
  adminLogin: async (email: string, password: string) => {
    const response = await apiFetch(
      '/admin/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      true // Skip auth redirect for login endpoint
    );

    if (!response.ok) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      try {
        const errorData = await response.json();
        // Backend returns: { success: false, error: "...", statusCode: ... }
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // Handle nested data structure from backend
    const token = data.data?.token || data.data?.data?.token || data.token;
    if (token) {
      setAuthToken(token);
    }
    return data;
  },

  adminSignup: async (email: string, password: string, fullName: string) => {
    const response = await apiFetch(
      '/admin/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      },
      true // Skip auth redirect for signup endpoint
    );

    if (!response.ok) {
      let errorMessage = 'Signup failed. Please try again.';
      
      try {
        const errorData = await response.json();
        // Backend returns: { success: false, error: "...", statusCode: ... }
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // Handle nested data structure from backend
    const token = data.data?.token || data.data?.data?.token || data.token;
    if (token) {
      setAuthToken(token);
    }
    return data;
  },

  // Admin Users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'complete' | 'incomplete';
    search?: string;
    metalType?: 'all' | 'gold' | 'silver' | 'iron';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.metalType && params.metalType !== 'all') queryParams.append('metalType', params.metalType);

    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch users');
    }

    const data = await response.json();
    return data;
  },

  getUserById: async (userId: string) => {
    const response = await apiFetch(`/admin/users/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch user');
    }

    const data = await response.json();
    return data;
  },

  getUserStats: async () => {
    const response = await apiFetch('/admin/users/stats');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch user stats');
    }

    const data = await response.json();
    return data;
  },

  // Admin Thoughts
  getThoughts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/thoughts${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch thoughts');
    }

    const data = await response.json();
    return data;
  },

  getThoughtById: async (thoughtId: string) => {
    const response = await apiFetch(`/admin/thoughts/${thoughtId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch thought');
    }

    const data = await response.json();
    return data;
  },

  deleteThought: async (thoughtId: string) => {
    const response = await apiFetch(`/admin/thoughts/${thoughtId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to delete thought');
    }

    const data = await response.json();
    return data;
  },

  // Admin Feedback
  getFeedback: async (params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'pending' | 'resolved';
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/feedback${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch feedback');
    }

    const data = await response.json();
    return data;
  },

  replyToFeedback: async (feedbackId: string, message: string) => {
    const response = await apiFetch(`/admin/feedback/${feedbackId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to reply to feedback');
    }

    const data = await response.json();
    return data;
  },

  updateFeedbackStatus: async (feedbackId: string, status: 'pending' | 'resolved') => {
    const response = await apiFetch(`/admin/feedback/${feedbackId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to update feedback status');
    }

    const data = await response.json();
    return data;
  },

  // Admin Broadcast
  sendBroadcast: async (title: string, message: string, targetAudience: 'all' | 'complete' | 'incomplete' | 'verified' | 'unverified') => {
    const response = await apiFetch('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message, targetAudience }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to send broadcast');
    }

    const data = await response.json();
    return data;
  },

  getBroadcastHistory: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/broadcast/history${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch broadcast history');
    }

    const data = await response.json();
    return data;
  },

  // Admin Dashboard
  getDashboardStats: async () => {
    const response = await apiFetch('/admin/dashboard/stats');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch dashboard stats');
    }

    const data = await response.json();
    return data;
  },

  // Admin Connections (Melt)
  getConnections: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/connections${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch connections');
    }

    const data = await response.json();
    return data;
  },

  getConnectionMessages: async (connectionId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/connections/${connectionId}/messages${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch connection messages');
    }

    const data = await response.json();
    return data;
  },

  // Health check
  healthCheck: async () => {
    const response = await apiFetch('/admin/health');

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  },
};

