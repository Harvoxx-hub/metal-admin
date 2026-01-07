'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { type Feedback } from '@/lib/mockData'
import { useDebounce } from '@/hooks/useDebounce'
import { MessageSquare, CheckCircle, Clock, Search, Send, X, Mail } from 'lucide-react'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [replyModal, setReplyModal] = useState<{ feedback: Feedback; message: string } | null>(null)
  const [sendingReply, setSendingReply] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await api.getFeedback({
          page,
          limit: 20,
          status: statusFilter,
          search: debouncedSearchQuery || undefined,
        })
        
        const feedbackData = response.data?.feedback || []
        setFeedback(feedbackData)
        setPagination(response.data?.pagination)
      } catch (err: any) {
        setError(err.message || 'Failed to load feedback')
        console.error('Error fetching feedback:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [page, statusFilter, debouncedSearchQuery])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedSearchQuery])

  // Note: Filtering is now done server-side via API
  const filteredFeedback = feedback

  // Get stats from backend (or calculate from current page)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  })

  useEffect(() => {
    // Calculate stats from pagination if available
    if (pagination) {
      // For accurate stats, we'd need a separate stats endpoint
      // For now, calculate from current data
      setStats({
        total: pagination.total || feedback.length,
        pending: feedback.filter((f) => f.status === 'pending').length,
        resolved: feedback.filter((f) => f.status === 'resolved').length,
      })
    } else {
      // Fallback: calculate from current feedback array
      setStats({
        total: feedback.length,
        pending: feedback.filter((f) => f.status === 'pending').length,
        resolved: feedback.filter((f) => f.status === 'resolved').length,
      })
    }
  }, [feedback, pagination])

  const handleReply = async () => {
    if (!replyModal || !replyModal.message.trim()) return

    setSendingReply(true)
    setError('')
    
    try {
      await api.replyToFeedback(replyModal.feedback.id, replyModal.message)
      
      // Refresh feedback to get updated data with reply
      const response = await api.getFeedback({
        page,
        limit: 20,
        status: statusFilter,
        search: debouncedSearchQuery || undefined,
      })
      const feedbackData = response.data?.feedback || []
      setFeedback(feedbackData)
      setPagination(response.data?.pagination)
      
      setReplyModal(null)
      setSelectedFeedback(null)
    } catch (err: any) {
      setError(err.message || 'Failed to send reply')
      console.error('Error sending reply:', err)
    } finally {
      setSendingReply(false)
    }
  }

  const handleStatusUpdate = async (feedbackId: string, newStatus: 'pending' | 'resolved') => {
    try {
      await api.updateFeedbackStatus(feedbackId, newStatus)
      
      // Refresh feedback list
      const response = await api.getFeedback({
        page,
        limit: 20,
        status: statusFilter,
        search: debouncedSearchQuery || undefined,
      })
      const feedbackData = response.data?.feedback || []
      setFeedback(feedbackData)
      setPagination(response.data?.pagination)
      
      // If updating selected feedback, update it too
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
      console.error('Error updating status:', err)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Highlight first 3 pending feedback
  const sortedFeedback = useMemo(() => {
    const pending = filteredFeedback.filter((f) => f.status === 'pending')
    const resolved = filteredFeedback.filter((f) => f.status === 'resolved')
    const sortedPending = pending.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return [...sortedPending, ...resolved]
  }, [filteredFeedback])

  return (
    <div className="min-h-screen bg-white">
      <Header title="Feedback Management" />

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total Feedback</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
            <p className="text-2xl font-bold">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback by message or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-black bg-white pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded border border-black px-4 py-2 ${
                statusFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`rounded border border-black px-4 py-2 ${
                statusFilter === 'pending' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`rounded border border-black px-4 py-2 ${
                statusFilter === 'resolved' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading feedback...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFeedback.length === 0 ? (
              <div className="rounded-lg border border-black p-8 text-center">
                <p className="text-gray-500">No feedback found</p>
              </div>
            ) : (
              sortedFeedback.map((item, index) => {
                const isHighlighted = item.status === 'pending' && index < 3
                return (
                  <div
                    key={item.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      isHighlighted
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-black hover:bg-gray-50'
                    }`}
                    onClick={async () => {
                      // Fetch full feedback details including replies
                      try {
                        // Use the item data directly since it should already have replies from the list
                        setSelectedFeedback(item)
                      } catch (err) {
                        console.error('Error loading feedback details:', err)
                        setSelectedFeedback(item) // Fallback to item data
                      }
                    }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div>
                            <Link
                              href={`/users?userId=${item.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium hover:underline"
                            >
                              {item.user.fullName}
                            </Link>
                            <p className="text-sm text-gray-600">@{item.user.username}</p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-700">{item.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTimeAgo(item.createdAt)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} feedback
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage || page === 1}
                className="rounded border border-black px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded border border-black px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Details Modal */}
      {selectedFeedback && !replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-black bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-lg font-semibold">User Information</h4>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div>
                    <div>
                      <Link
                        href={`/users?userId=${selectedFeedback.userId}`}
                        className="font-medium hover:underline"
                      >
                        {selectedFeedback.user.fullName}
                      </Link>
                      <p className="text-sm text-gray-600">@{selectedFeedback.user.username}</p>
                      <p className="text-sm text-gray-600">
                        <Mail className="mr-1 inline h-3 w-3" />
                        {selectedFeedback.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold">Feedback Details</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{selectedFeedback.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium">{formatDate(selectedFeedback.createdAt)}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(selectedFeedback.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="rounded border border-gray-200 bg-gray-50 p-3">{selectedFeedback.message}</p>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              {selectedFeedback.replies && selectedFeedback.replies.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold">Replies</h4>
                  <div className="space-y-3">
                    {selectedFeedback.replies.map((reply: any) => (
                      <div key={reply.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-medium">{reply.adminName || 'Admin'}</p>
                          <p className="text-xs text-gray-500">{formatDate(reply.createdAt)}</p>
                        </div>
                        <p className="text-sm text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {selectedFeedback.status === 'pending' && (
                  <>
                    <button
                      onClick={() =>
                        setReplyModal({ feedback: selectedFeedback, message: '' })
                      }
                      className="flex items-center gap-2 rounded border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
                    >
                      <Send className="h-4 w-4" />
                      Reply
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                      className="rounded border border-green-500 bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                    >
                      Mark as Resolved
                    </button>
                  </>
                )}
                {selectedFeedback.status === 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedFeedback.id, 'pending')}
                    className="rounded border border-yellow-500 bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                  >
                    Mark as Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg border border-black bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Reply to Feedback</h3>
              <button
                onClick={() => setReplyModal(null)}
                className="rounded border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">To: {replyModal.feedback.user.fullName}</p>
              <p className="text-xs text-gray-500">Email: {replyModal.feedback.user.email}</p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Message (required)</label>
              <textarea
                value={replyModal.message}
                onChange={(e) => setReplyModal({ ...replyModal, message: e.target.value })}
                placeholder="Enter your reply message..."
                required
                className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReplyModal(null)}
                className="flex-1 rounded border border-black px-4 py-2 hover:bg-gray-100"
                disabled={sendingReply}
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyModal.message.trim() || sendingReply}
                className="flex items-center justify-center gap-2 flex-1 rounded border border-black bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {sendingReply ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

