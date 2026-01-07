'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { type User } from '@/lib/mockData'
import { useDebounce } from '@/hooks/useDebounce'
import { Users, UserCheck, UserPlus, ShieldCheck, Search, Eye, X, MapPin } from 'lucide-react'

function UsersPageContent() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'incomplete'>('all')

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedSearchQuery])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await api.getUsers({
          page,
          limit: 20,
          status: statusFilter,
          search: debouncedSearchQuery || undefined,
        })
        
        setUsers(response.data?.users || [])
        setPagination(response.data?.pagination)
        
        // Check if userId is in URL params and open that user's modal
        const userId = searchParams.get('userId')
        if (userId) {
          try {
            const userResponse = await api.getUserById(userId)
            const userData = userResponse.data
            // Map backend user data to frontend format
            setSelectedUser({
              id: userData.id,
              fullName: userData.fullname || '',
              username: userData.username || '',
              email: userData.email || '',
              phone: userData.phone || '',
              status: userData.completedProfile ? 'complete' : 'incomplete',
              isVerified: userData.isVerified || false,
              metalId: userData.metalId || null,
              metalName: userData.metalName || null,
              createdAt: userData.createdAt || '',
              lastActive: userData.lastActiveAt || userData.updatedAt || userData.createdAt || '',
              sparkBalance: userData.sparkBalance || 0,
              connectionCount: userData.connectionsCount || 0,
              location: userData.location || null,
            })
          } catch (err) {
            console.error('Error fetching user details:', err)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load users')
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [searchParams, page, statusFilter, debouncedSearchQuery])

  // Note: Filtering is now done server-side via API
  const filteredUsers = users

  const [stats, setStats] = useState({
    total: 0,
    complete: 0,
    incomplete: 0,
    newToday: 0,
    verified: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getUserStats()
        setStats({
          total: response.data.total || 0,
          complete: response.data.complete || 0,
          incomplete: response.data.incomplete || 0,
          newToday: response.data.newToday || 0,
          verified: response.data.verified || 0,
        })
      } catch (err) {
        console.error('Error fetching user stats:', err)
      }
    }
    fetchStats()
  }, [])

  const getMetalIcon = (metalName: string) => {
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
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="User Management" />

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Complete Users</p>
            </div>
            <p className="text-2xl font-bold">{stats.complete}</p>
          </div>
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">New Today</p>
            </div>
            <p className="text-2xl font-bold">{stats.newToday}</p>
          </div>
          <div className="rounded-lg border border-black p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Verified</p>
            </div>
            <p className="text-2xl font-bold">{stats.verified}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, username, email, or phone..."
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
              onClick={() => {
                setStatusFilter('all')
                setPage(1)
              }}
              className={`rounded border border-black px-4 py-2 ${
                statusFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setStatusFilter('complete')
                setPage(1)
              }}
              className={`rounded border border-black px-4 py-2 ${
                statusFilter === 'complete' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Complete
            </button>
            <button
              onClick={() => {
                setStatusFilter('incomplete')
                setPage(1)
              }}
              className={`rounded border border-black px-4 py-2 ${
                statusFilter === 'incomplete' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Incomplete
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-black">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Location</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Metal Type</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Registered</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        {user.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>
                              {user.location.city || ''}
                              {user.location.city && user.location.state ? ', ' : ''}
                              {user.location.state || ''}
                              {user.location.country && (user.location.city || user.location.state) ? ', ' : ''}
                              {user.location.country || ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs capitalize ${
                            user.status === 'complete'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.metalName ? (
                          <span className="flex items-center gap-1">
                            {getMetalIcon(user.metalName)}
                            <span className="capitalize">{user.metalName}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            try {
                              const userResponse = await api.getUserById(user.id)
                              const userData = userResponse.data
                              // Map backend user data to frontend format
                              setSelectedUser({
                                id: userData.id,
                                fullName: userData.fullname || '',
                                username: userData.username || '',
                                email: userData.email || '',
                                phone: userData.phone || '',
                                status: userData.completedProfile ? 'complete' : 'incomplete',
                                isVerified: userData.isVerified || false,
                                metalId: userData.metalId || null,
                                metalName: userData.metalName || null,
                                createdAt: userData.createdAt || '',
                                lastActive: userData.lastActiveAt || userData.updatedAt || userData.createdAt || '',
                                sparkBalance: userData.sparkBalance || 0,
                                connectionCount: userData.connectionsCount || 0,
                                location: userData.location || null,
                              })
                            } catch (err) {
                              console.error('Error fetching user details:', err)
                            }
                          }}
                          className="flex items-center gap-1 rounded border border-black px-3 py-1 text-sm hover:bg-black hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          View
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
              Showing {((page - 1) * (pagination.limit || 20)) + 1} to{' '}
              {Math.min(page * (pagination.limit || 20), pagination.total)} of {pagination.total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded border border-black px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-black bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-lg font-semibold">Profile Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="font-medium">@{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Metal Type</p>
                    <p className="font-medium">
                      {selectedUser.metalName ? (
                        <>
                          {getMetalIcon(selectedUser.metalName)} {selectedUser.metalName}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verification Status</p>
                    <p className="font-medium">{selectedUser.isVerified ? 'Verified' : 'Not Verified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold">Location</h4>
                {selectedUser.location ? (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.location.address && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">{selectedUser.location.address}</p>
                        </div>
                      )}
                      {selectedUser.location.city && (
                        <div>
                          <p className="text-sm text-gray-600">City</p>
                          <p className="font-medium">{selectedUser.location.city}</p>
                        </div>
                      )}
                      {selectedUser.location.state && (
                        <div>
                          <p className="text-sm text-gray-600">State/Province</p>
                          <p className="font-medium">{selectedUser.location.state}</p>
                        </div>
                      )}
                      {selectedUser.location.country && (
                        <div>
                          <p className="text-sm text-gray-600">Country</p>
                          <p className="font-medium">{selectedUser.location.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No location information available</p>
                )}
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold">Activity Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Active</p>
                    <p className="font-medium">{formatDate(selectedUser.lastActive)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spark Balance</p>
                    <p className="font-medium">{selectedUser.sparkBalance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Connections</p>
                    <p className="font-medium">{selectedUser.connectionCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header title="Users" />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UsersPageContent />
    </Suspense>
  )
}

