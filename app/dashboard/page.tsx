'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { Users, MessageSquare, UserPlus, Link as LinkIcon, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recentThoughts, setRecentThoughts] = useState<any[]>([])
  const [thoughtsLoading, setThoughtsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Fetch dashboard stats
        const statsResponse = await api.getDashboardStats()
        const stats = statsResponse.data
        
        // Map dashboard stats to metrics format
        setMetrics({
          totalActiveUsers: stats.totalActiveUsers || 0,
          todaysThoughts: stats.todaysThoughts || 0,
          todaysUsers: stats.todaysUsers || 0,
          todaysConnections: stats.todaysConnections || 0,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data')
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchRecentThoughts = async () => {
      setThoughtsLoading(true)
      try {
        // Fetch recent thoughts (limit to 5 for dashboard)
        const response = await api.getThoughts({ page: 1, limit: 5 })
        const thoughtsData = response.data?.thoughts || []
        setRecentThoughts(thoughtsData)
      } catch (err: any) {
        console.error('Error fetching recent thoughts:', err)
        // Don't set error state, just log it
      } finally {
        setThoughtsLoading(false)
      }
    }

    fetchRecentThoughts()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getMetalIcon = (metalName: string | null | undefined) => {
    if (!metalName) return ''
    const nameLower = metalName.toLowerCase()
    // Handle various metal name formats
    if (nameLower.includes('gold')) return '🥇'
    if (nameLower.includes('silver')) return '🥈'
    if (nameLower.includes('iron') || nameLower.includes('bronze')) return '🥉'
    // Default icon for other metals
    return '⭐'
  }

  const metricCards = [
    {
      title: 'Total Active Users',
      value: metrics?.totalActiveUsers.toLocaleString() || '0',
      icon: Users,
      change: '+12%',
    },
    {
      title: "Today's Thoughts",
      value: metrics?.todaysThoughts || '0',
      icon: MessageSquare,
      change: '+8%',
    },
    {
      title: "Today's Users",
      value: metrics?.todaysUsers || '0',
      icon: UserPlus,
      change: '+5%',
    },
    {
      title: "Today's Connections",
      value: metrics?.todaysConnections || '0',
      icon: LinkIcon,
      change: '+15%',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header title="Dashboard" />

      <div className="p-6">
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {metricCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div
                    key={index}
                    className="group rounded-lg border border-black p-6 transition-all hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg border border-black p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{card.change}</span>
                      </div>
                    </div>
                    <h3 className="mb-2 text-sm font-medium text-gray-600">{card.title}</h3>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Recent Thoughts */}
            <div className="rounded-lg border border-black p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Recent Thoughts</h3>
                <button className="text-sm font-medium underline hover:no-underline">
                  View All
                </button>
              </div>
              {thoughtsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-600">Loading thoughts...</p>
                </div>
              ) : recentThoughts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No thoughts found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentThoughts.map((thought) => (
                    <div
                      key={thought.id}
                      className="rounded-lg border border-gray-200 p-4 transition-all hover:border-black"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getMetalIcon(thought.user?.metalName)}</span>
                          <Link
                            href={`/users?userId=${thought.userId}`}
                            className="font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {thought.user?.fullName || 'Unknown User'}
                          </Link>
                          <span className="text-sm text-gray-600">@{thought.user?.username || 'unknown'}</span>
                        </div>
                        {thought.connectionOnly && (
                          <span className="ml-auto rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs">
                            Connection Only
                          </span>
                        )}
                      </div>
                      <p className="mb-3 text-sm leading-relaxed text-gray-700">{thought.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTimeAgo(thought.createdAt)}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thought.reactionCount || 0} reactions
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
