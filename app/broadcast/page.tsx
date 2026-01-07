'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { type Broadcast } from '@/lib/mockData'
import { Send, RefreshCw, CheckCircle, Clock, XCircle, AlertCircle, X } from 'lucide-react'

export default function BroadcastPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send')
  const [broadcastHistory, setBroadcastHistory] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [error, setError] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetAudience, setTargetAudience] = useState<
    'all' | 'complete' | 'incomplete' | 'verified' | 'unverified'
  >('all')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (activeTab === 'history') {
      fetchBroadcastHistory()
    }
  }, [activeTab, page])

  const fetchBroadcastHistory = async () => {
    setHistoryLoading(true)
    setError('')
    
    try {
      const response = await api.getBroadcastHistory({ page, limit: 20 })
      const broadcasts = response.data?.broadcasts || []
      
      // Map backend format to frontend format
      const mappedBroadcasts = broadcasts.map((broadcast: any) => ({
        id: broadcast.id,
        title: broadcast.title || '',
        message: broadcast.message || '',
        targetAudience: broadcast.targetAudience || 'all',
        recipientsCount: broadcast.recipientCount || 0,
        totalUsers: broadcast.recipientCount || 0, // Use recipientCount for both
        status: broadcast.status === 'sent' ? 'completed' : broadcast.status || 'pending',
        createdAt: broadcast.createdAt || broadcast.sentAt || '',
      }))
      
      setBroadcastHistory(mappedBroadcasts)
      setPagination(response.data?.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to load broadcast history')
      console.error('Error fetching broadcast history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    setError('')

    try {
      const response = await api.sendBroadcast(title, message, targetAudience)
      setSuccessMessage(`Broadcast sent successfully to ${response.data?.recipientCount || 0} recipients!`)
      
      // Clear form
      setTitle('')
      setMessage('')
      setTargetAudience('all')
      
      // Refresh history if on history tab
      if (activeTab === 'history') {
        fetchBroadcastHistory()
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send broadcast. Please try again.'
      setErrorMessage(errorMsg)
      setError(errorMsg)
      console.error('Error sending broadcast:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClear = () => {
    setTitle('')
    setMessage('')
    setTargetAudience('all')
    setSuccessMessage('')
    setErrorMessage('')
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

  const getStatusBadge = (status: Broadcast['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-800">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        )
      case 'sending':
        return (
          <span className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
            <Clock className="h-3 w-3" />
            Sending
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-800">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        )
      case 'pending':
        return (
          <span className="flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  const getAudienceBadge = (audience: Broadcast['targetAudience']) => {
    const labels = {
      all: 'All Users',
      complete: 'Complete Users',
      incomplete: 'Incomplete Users',
      verified: 'Verified Users',
      unverified: 'Unverified Users',
    }
    return (
      <span className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs">
        {labels[audience]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Broadcast Management" />

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('send')}
            className={`border-b-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'send'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Send Broadcast
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Broadcast History
          </button>
        </div>

        {/* Send Broadcast Tab */}
        {activeTab === 'send' && (
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                  className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter notification title..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {title.length}/200 characters
                </p>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Notification Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={5000}
                  required
                  rows={6}
                  className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter notification message..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {message.length}/5000 characters
                </p>
              </div>

              {/* Target Audience */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Users' },
                    { value: 'complete', label: 'Complete Users Only' },
                    { value: 'incomplete', label: 'Incomplete Users Only' },
                    { value: 'verified', label: 'Verified Users Only' },
                    { value: 'unverified', label: 'Unverified Users Only' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="targetAudience"
                        value={option.value}
                        checked={targetAudience === option.value}
                        onChange={(e) =>
                          setTargetAudience(e.target.value as Broadcast['targetAudience'])
                        }
                        className="h-4 w-4 border-black text-black focus:ring-black"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="rounded border border-green-500 bg-green-50 p-3 text-sm text-green-800">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-800">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !message.trim()}
                  className="flex items-center gap-2 rounded border border-black bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:bg-gray-400"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending...' : 'Send Broadcast'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={submitting}
                  className="rounded border border-black px-6 py-2 hover:bg-gray-100 disabled:bg-gray-200"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Broadcast History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Broadcast History</h3>
              <button
                onClick={fetchBroadcastHistory}
                disabled={historyLoading}
                className="flex items-center gap-2 rounded border border-black px-4 py-2 hover:bg-gray-100 disabled:bg-gray-200"
              >
                <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Loading history...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-black">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">
                        Title & Message
                      </th>
                      <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">
                        Target Audience
                      </th>
                      <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">
                        Recipients
                      </th>
                      <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {broadcastHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No broadcast history found
                        </td>
                      </tr>
                    ) : (
                      broadcastHistory.map((broadcast) => (
                        <tr key={broadcast.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{broadcast.title}</p>
                              <p className="mt-1 max-w-md truncate text-sm text-gray-600">
                                {broadcast.message}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">{getAudienceBadge(broadcast.targetAudience)}</td>
                          <td className="px-4 py-3 text-sm">
                            {broadcast.recipientsCount.toLocaleString()} /{' '}
                            {broadcast.totalUsers.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(broadcast.status)}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p>{formatDate(broadcast.createdAt)}</p>
                              <p className="text-xs text-gray-500">{formatTimeAgo(broadcast.createdAt)}</p>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} broadcasts
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
        )}
      </div>
    </div>
  )
}

