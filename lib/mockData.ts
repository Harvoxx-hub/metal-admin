// Mock data for the admin dashboard

export interface User {
  id: string
  fullName: string
  username: string
  email: string
  phone: string
  status: 'complete' | 'incomplete'
  isVerified: boolean
  metalId?: string | null
  metalName?: string | null
  createdAt: string
  lastActive: string
  profilePhoto?: string
  sparkBalance: number
  connectionCount: number
  location?: {
    city?: string
    state?: string
    country?: string
    address?: string
  }
}

export interface Thought {
  id: string
  userId: string
  user: {
    fullName: string
    username: string
    metalId?: string | null
    metalName?: string | null
    profilePhoto?: string
  }
  content: string
  connectionOnly: boolean
  createdAt: string
  reactionCount: number
}

export interface Activity {
  id: string
  type: 'registration' | 'thought' | 'moderation' | 'deletion'
  title: string
  description: string
  timestamp: string
}

export interface Feedback {
  id: string
  userId: string
  user: {
    fullName: string
    username: string
    email: string
    metalId?: string | null
    metalName?: string | null
    profilePhoto?: string
  }
  message: string
  status: 'pending' | 'resolved'
  createdAt: string
  replies?: Array<{
    id: string
    adminId: string
    adminName: string
    message: string
    createdAt: string
  }>
}

export interface Broadcast {
  id: string
  title: string
  message: string
  targetAudience: 'all' | 'complete' | 'incomplete' | 'verified' | 'unverified'
  recipientsCount: number
  totalUsers: number
  status: 'completed' | 'sending' | 'failed' | 'pending'
  createdAt: string
}

export interface DashboardMetrics {
  totalActiveUsers: number
  todaysThoughts: number
  todaysUsers: number
  todaysConnections: number
}

export interface ActivityChartData {
  day: string
  systemLoad: number
  responseTime: number
  activeSystem: number
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 'complete',
    isVerified: true,
    metalType: 'gold',
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: '2024-01-20T15:30:00Z',
    sparkBalance: 150,
    connectionCount: 25,
    location: {
      city: 'New York',
      state: 'New York',
      country: 'United States',
      address: '123 Main Street',
    },
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    phone: '+1234567891',
    status: 'complete',
    isVerified: true,
    metalType: 'silver',
    createdAt: '2024-01-16T11:00:00Z',
    lastActive: '2024-01-20T14:00:00Z',
    sparkBalance: 89,
    connectionCount: 12,
    location: {
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      address: '456 Oak Avenue',
    },
  },
  {
    id: '3',
    fullName: 'Bob Johnson',
    username: 'bobjohnson',
    email: 'bob@example.com',
    phone: '+1234567892',
    status: 'incomplete',
    isVerified: false,
    metalType: 'iron',
    createdAt: '2024-01-17T12:00:00Z',
    lastActive: '2024-01-18T10:00:00Z',
    sparkBalance: 45,
    connectionCount: 5,
    location: {
      city: 'Chicago',
      state: 'Illinois',
      country: 'United States',
    },
  },
  {
    id: '4',
    fullName: 'Alice Williams',
    username: 'alicew',
    email: 'alice@example.com',
    phone: '+1234567893',
    status: 'complete',
    isVerified: true,
    metalType: 'gold',
    createdAt: '2024-01-18T09:00:00Z',
    lastActive: '2024-01-20T16:00:00Z',
    sparkBalance: 200,
    connectionCount: 40,
    location: {
      city: 'London',
      country: 'United Kingdom',
      address: '789 Park Lane',
    },
  },
  {
    id: '5',
    fullName: 'Charlie Brown',
    username: 'charlieb',
    email: 'charlie@example.com',
    phone: '+1234567894',
    status: 'incomplete',
    isVerified: false,
    metalType: 'silver',
    createdAt: '2024-01-19T08:00:00Z',
    lastActive: '2024-01-20T13:00:00Z',
    sparkBalance: 67,
    connectionCount: 8,
    location: {
      city: 'Toronto',
      state: 'Ontario',
      country: 'Canada',
    },
  },
]

// Mock Thoughts
export const mockThoughts: Thought[] = [
  {
    id: '1',
    userId: '1',
    user: {
      fullName: 'John Doe',
      username: 'johndoe',
      metalType: 'gold',
    },
    content: 'This is my first thought on the platform. Excited to connect with others!',
    connectionOnly: false,
    createdAt: '2024-01-20T10:00:00Z',
    reactionCount: 12,
  },
  {
    id: '2',
    userId: '2',
    user: {
      fullName: 'Jane Smith',
      username: 'janesmith',
      metalType: 'silver',
    },
    content: 'Connection-only thought: Only my connections can see this.',
    connectionOnly: true,
    createdAt: '2024-01-20T11:30:00Z',
    reactionCount: 5,
  },
  {
    id: '3',
    userId: '4',
    user: {
      fullName: 'Alice Williams',
      username: 'alicew',
      metalType: 'gold',
    },
    content: 'Another public thought for everyone to see and engage with.',
    connectionOnly: false,
    createdAt: '2024-01-20T12:15:00Z',
    reactionCount: 28,
  },
  {
    id: '4',
    userId: '1',
    user: {
      fullName: 'John Doe',
      username: 'johndoe',
      metalType: 'gold',
    },
    content: 'Sharing some insights about the platform experience.',
    connectionOnly: false,
    createdAt: '2024-01-20T13:45:00Z',
    reactionCount: 8,
  },
  {
    id: '5',
    userId: '5',
    user: {
      fullName: 'Charlie Brown',
      username: 'charlieb',
      metalType: 'silver',
    },
    content: 'A thought from a silver member.',
    connectionOnly: true,
    createdAt: '2024-01-20T14:20:00Z',
    reactionCount: 3,
  },
]

// Mock Feedback
export const mockFeedback: Feedback[] = [
  {
    id: '1',
    userId: '1',
    user: {
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      metalType: 'gold',
    },
    message: 'I would like to report an issue with the messaging feature. Messages are not being delivered properly.',
    status: 'pending',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    userId: '2',
    user: {
      fullName: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      metalType: 'silver',
    },
    message: 'Great platform! However, I think the user interface could be improved for better accessibility.',
    status: 'pending',
    createdAt: '2024-01-20T11:30:00Z',
  },
  {
    id: '3',
    userId: '4',
    user: {
      fullName: 'Alice Williams',
      username: 'alicew',
      email: 'alice@example.com',
      metalType: 'gold',
    },
    message: 'I have a suggestion for a new feature: adding video calling capability would be amazing!',
    status: 'resolved',
    createdAt: '2024-01-19T14:20:00Z',
  },
  {
    id: '4',
    userId: '3',
    user: {
      fullName: 'Bob Johnson',
      username: 'bobjohnson',
      email: 'bob@example.com',
      metalType: 'iron',
    },
    message: 'I am experiencing login issues. Unable to access my account for the past 2 days.',
    status: 'pending',
    createdAt: '2024-01-20T09:15:00Z',
  },
  {
    id: '5',
    userId: '5',
    user: {
      fullName: 'Charlie Brown',
      username: 'charlieb',
      email: 'charlie@example.com',
      metalType: 'silver',
    },
    message: 'The app is working great! Thank you for all the updates.',
    status: 'resolved',
    createdAt: '2024-01-18T16:45:00Z',
  },
]

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'registration',
    title: 'New Metal Registration',
    description: 'John Doe registered as a Gold member',
    timestamp: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    type: 'thought',
    title: 'New Thought Posting',
    description: 'Jane Smith posted a new thought',
    timestamp: '2024-01-20T11:30:00Z',
  },
  {
    id: '3',
    type: 'moderation',
    title: 'Content Moderation',
    description: 'Admin reviewed and approved a thought',
    timestamp: '2024-01-20T12:00:00Z',
  },
  {
    id: '4',
    type: 'registration',
    title: 'New Metal Registration',
    description: 'Alice Williams registered as a Gold member',
    timestamp: '2024-01-20T13:00:00Z',
  },
  {
    id: '5',
    type: 'thought',
    title: 'New Thought Posting',
    description: 'John Doe posted a new thought',
    timestamp: '2024-01-20T13:45:00Z',
  },
]

// Mock Dashboard Metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalActiveUsers: 1248,
  todaysThoughts: 156,
  todaysUsers: 23,
  todaysConnections: 89,
}

// Mock Activity Chart Data
export const mockChartData: ActivityChartData[] = [
  { day: 'Mon', systemLoad: 45, responseTime: 120, activeSystem: 85 },
  { day: 'Tue', systemLoad: 52, responseTime: 135, activeSystem: 88 },
  { day: 'Wed', systemLoad: 48, responseTime: 110, activeSystem: 90 },
  { day: 'Thu', systemLoad: 55, responseTime: 125, activeSystem: 87 },
  { day: 'Fri', systemLoad: 60, responseTime: 140, activeSystem: 92 },
  { day: 'Sat', systemLoad: 50, responseTime: 115, activeSystem: 89 },
  { day: 'Sun', systemLoad: 47, responseTime: 130, activeSystem: 86 },
]

// Mock service functions with delays to simulate API calls
export const mockApi = {
  getUsers: (): Promise<User[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500))
  },

  getThoughts: (): Promise<Thought[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockThoughts), 500))
  },

  deleteThought: (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 500))
  },

  getActivities: (): Promise<Activity[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockActivities), 500))
  },

  getDashboardMetrics: (): Promise<DashboardMetrics> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockDashboardMetrics), 500))
  },

  getChartData: (): Promise<ActivityChartData[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockChartData), 500))
  },

  getFeedback: (): Promise<Feedback[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockFeedback), 500))
  },

  replyToFeedback: (id: string, message: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 500))
  },

  updateFeedbackStatus: (id: string, status: 'pending' | 'resolved'): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 500))
  },

  sendBroadcast: (
    title: string,
    message: string,
    targetAudience: 'all' | 'complete' | 'incomplete' | 'verified' | 'unverified'
  ): Promise<Broadcast> => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: Date.now().toString(),
            title,
            message,
            targetAudience,
            recipientsCount: 0,
            totalUsers: 1000,
            status: 'pending',
            createdAt: new Date().toISOString(),
          }),
        500
      )
    )
  },

  getBroadcastHistory: (): Promise<Broadcast[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockBroadcasts), 500))
  },
}

// Mock Broadcast History
export const mockBroadcasts: Broadcast[] = [
  {
    id: '1',
    title: 'Welcome to Metal Platform',
    message: 'Thank you for joining our platform! We are excited to have you here.',
    targetAudience: 'all',
    recipientsCount: 1248,
    totalUsers: 1248,
    status: 'completed',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'New Feature Announcement',
    message: 'We have added a new messaging feature. Check it out now!',
    targetAudience: 'verified',
    recipientsCount: 856,
    totalUsers: 856,
    status: 'completed',
    createdAt: '2024-01-19T14:30:00Z',
  },
  {
    id: '3',
    title: 'Platform Maintenance Notice',
    message: 'Scheduled maintenance will occur on Friday. The platform will be unavailable for 2 hours.',
    targetAudience: 'complete',
    recipientsCount: 920,
    totalUsers: 920,
    status: 'sending',
    createdAt: '2024-01-20T15:00:00Z',
  },
  {
    id: '4',
    title: 'Profile Completion Reminder',
    message: 'Please complete your profile to access all features of the platform.',
    targetAudience: 'incomplete',
    recipientsCount: 328,
    totalUsers: 328,
    status: 'completed',
    createdAt: '2024-01-18T09:00:00Z',
  },
  {
    id: '5',
    title: 'System Update',
    message: 'We have updated our system for better performance. Enjoy the improved experience!',
    targetAudience: 'all',
    recipientsCount: 0,
    totalUsers: 1248,
    status: 'failed',
    createdAt: '2024-01-17T11:00:00Z',
  },
]


