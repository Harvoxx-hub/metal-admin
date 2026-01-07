'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { type Thought } from '@/lib/mockData'
import { useDebounce } from '@/hooks/useDebounce'
import { Search, Calendar, Trash2, X, Eye } from 'lucide-react'

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [dateFilter, setDateFilter] = useState('')
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ thought: Thought; showReason: boolean; reason: string } | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  const [error, setError] = useState('')

  useEffect(() => {
    const fetchThoughts = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await api.getThoughts({ 
          page,
          limit: 20,
          search: debouncedSearchQuery || undefined,
        })
        
        // Backend now returns thoughts with user data already included
        const thoughtsData = response.data?.thoughts || []
        setThoughts(thoughtsData)
        setPagination(response.data?.pagination)
      } catch (err: any) {
        setError(err.message || 'Failed to load thoughts')
        console.error('Error fetching thoughts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchThoughts()
  }, [page, debouncedSearchQuery])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery])

  // Filter by date (client-side since backend doesn't support date filtering yet)
  const filteredThoughts = useMemo(() => {
    let filtered = thoughts

    // Date filter (client-side)
    if (dateFilter) {
      filtered = filtered.filter((thought) => {
        const thoughtDate = new Date(thought.createdAt).toDateString()
        const filterDate = new Date(dateFilter).toDateString()
        return thoughtDate === filterDate
      })
    }

    return filtered
  }, [thoughts, dateFilter])

  const handleDelete = async (thoughtId: string, reason: string) => {
    try {
      await api.deleteThought(thoughtId)
      setThoughts(thoughts.filter((t) => t.id !== thoughtId))
      setDeleteModal(null)
      setSelectedThought(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete thought')
      console.error('Error deleting thought:', err)
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

  return (
    <div className="min-h-screen bg-white">
      <Header title="Thoughts Management" />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search thoughts by content or user..."
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
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded border border-black bg-white pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Thoughts Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading thoughts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-black">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Content</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Reactions</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredThoughts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No thoughts found
                    </td>
                  </tr>
                ) : (
                  filteredThoughts.map((thought) => (
                    <tr
                      key={thought.id}
                      className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                      onClick={() => setSelectedThought(thought)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            href={`/users?userId=${thought.userId}`}
                            className="font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {thought.user.fullName}
                          </Link>
                          <p className="text-sm text-gray-600">@{thought.user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-md truncate text-sm">{thought.content}</p>
                      </td>
                      <td className="px-4 py-3">
                        {thought.connectionOnly ? (
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs">Connection Only</span>
                        ) : (
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs">Public</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(thought.createdAt)}</td>
                      <td className="px-4 py-3 text-sm">{thought.reactionCount}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteModal({ thought, showReason: false, reason: '' })
                          }}
                          className="flex items-center gap-1 rounded border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
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
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} thoughts
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

      {/* Thought Details Modal */}
      {selectedThought && !deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-black bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Thought Details</h3>
              <button
                onClick={() => setSelectedThought(null)}
                className="rounded border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-lg font-semibold">User Information</h4>
                <div>
                  <Link
                    href={`/users?userId=${selectedThought.userId}`}
                    className="font-medium hover:underline"
                  >
                    {selectedThought.user.fullName}
                  </Link>
                  <p className="text-sm text-gray-600">@{selectedThought.user.username}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold">Thought Details</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium">{formatDate(selectedThought.createdAt)}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(selectedThought.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">
                      {selectedThought.connectionOnly ? 'Connection Only' : 'Public'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reactions</p>
                    <p className="font-medium">{selectedThought.reactionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Content</p>
                    <p className="rounded border border-gray-200 bg-gray-50 p-3">{selectedThought.content}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModal({ thought: selectedThought, showReason: false, reason: '' })
                  }}
                  className="rounded border border-red-500 px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Delete Thought
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg border border-black bg-white p-6">
            {!deleteModal.showReason ? (
              <>
                <h3 className="mb-4 text-xl font-bold">Delete Thought</h3>
                <p className="mb-6 text-gray-600">
                  Are you sure you want to delete this thought? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 rounded border border-black px-4 py-2 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({ ...deleteModal, showReason: true })
                    }
                    className="flex-1 rounded border border-red-500 bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-4 text-xl font-bold">Delete Thought</h3>
                <p className="mb-4 text-sm text-gray-600">Please provide a reason for deletion (required):</p>
                  <textarea
                  value={deleteModal.reason}
                  onChange={(e) =>
                    setDeleteModal({ ...deleteModal, reason: e.target.value })
                  }
                  placeholder="Enter reason for deletion..."
                  required
                  className="mb-4 w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 rounded border border-black px-4 py-2 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteModal.reason.trim()) {
                        handleDelete(deleteModal.thought.id, deleteModal.reason)
                      }
                    }}
                    disabled={!deleteModal.reason.trim()}
                    className="flex-1 rounded border border-red-500 bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:bg-gray-400"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

