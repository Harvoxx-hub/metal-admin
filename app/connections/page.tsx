'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import { Search, MessageSquare, X, ArrowLeft, ChevronRight } from 'lucide-react'

interface Connection {
  id: string
  user1: {
    id: string
    fullName: string
    username: string
    email?: string
    metalName?: string | null
    profilePhoto?: string | null
  }
  user2: {
    id: string
    fullName: string
    username: string
    email?: string
    metalName?: string | null
    profilePhoto?: string | null
  }
  status: string
  connectedOn: string
  lastUpdatedAt: string
  lastMessage?: string | null
  lastSenderId?: string | null
}

interface Message {
  id: string
  senderId: string
  sender: {
    id: string
    fullName: string
    username: string
    profilePhoto?: string | null
  }
  message: string
  type?: string
  createdAt: string
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [error, setError] = useState('')
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesPage, setMessagesPage] = useState(1)
  const [messagesPagination, setMessagesPagination] = useState<any>(null)

  useEffect(() => {
    fetchConnections()
  }, [page])

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection.id)
    }
  }, [selectedConnection, messagesPage])

  const fetchConnections = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.getConnections({ page, limit: 20 })
      const connectionsData = response.data?.connections || []
      setConnections(connectionsData)
      setPagination(response.data?.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to load connections')
      console.error('Error fetching connections:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (connectionId: string) => {
    setMessagesLoading(true)
    
    try {
      const response = await api.getConnectionMessages(connectionId, { page: messagesPage, limit: 50 })
      const messagesData = response.data?.messages || []
      setMessages(messagesData)
      setMessagesPagination(response.data?.pagination)
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message || 'Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
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

  if (selectedConnection) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Connection Messages" />
        
        <div className="p-6">
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedConnection(null)
              setMessages([])
              setMessagesPage(1)
            }}
            className="mb-4 flex items-center gap-2 rounded border border-black px-4 py-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Connections
          </button>

          {/* Connection Info */}
          <div className="mb-6 rounded-lg border border-black p-4">
            <h3 className="mb-4 text-lg font-semibold">Connection Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">User 1</p>
                <Link
                  href={`/users?userId=${selectedConnection.user1.id}`}
                  className="font-medium hover:underline"
                >
                  {selectedConnection.user1.fullName}
                </Link>
                <p className="text-sm text-gray-600">@{selectedConnection.user1.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User 2</p>
                <Link
                  href={`/users?userId=${selectedConnection.user2.id}`}
                  className="font-medium hover:underline"
                >
                  {selectedConnection.user2.fullName}
                </Link>
                <p className="text-sm text-gray-600">@{selectedConnection.user2.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Connected On</p>
                <p className="font-medium">{formatDate(selectedConnection.connectedOn)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Activity</p>
                <p className="font-medium">{formatDate(selectedConnection.lastUpdatedAt)}</p>
                <p className="text-xs text-gray-500">{formatTimeAgo(selectedConnection.lastUpdatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Messages List */}
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Messages ({messagesPagination?.total || 0})
                </h3>
              </div>

              {messages.length === 0 ? (
                <div className="rounded-lg border border-black p-8 text-center">
                  <p className="text-gray-500">No messages found in this connection</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={message.id || `message-${index}-${message.createdAt || Date.now()}`}
                      className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/users?userId=${message.sender.id}`}
                            className="font-medium hover:underline"
                          >
                            {message.sender.fullName}
                          </Link>
                          <span className="text-sm text-gray-600">
                            @{message.sender.username}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(message.createdAt)}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(message.createdAt)}</p>
                        </div>
                      </div>
                      <div className="rounded border border-gray-200 bg-gray-50 p-3">
                        <p className="text-sm text-gray-700">
                          {message.message || '[Media message]'}
                        </p>
                        {message.type && message.type !== 'text' && (
                          <p className="mt-1 text-xs text-gray-500">Type: {message.type}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Messages Pagination */}
              {messagesPagination && messagesPagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((messagesPagination.page - 1) * messagesPagination.limit) + 1} to{' '}
                    {Math.min(messagesPagination.page * messagesPagination.limit, messagesPagination.total)} of {messagesPagination.total} messages
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMessagesPage(messagesPage - 1)}
                      disabled={!messagesPagination.hasPrevPage || messagesPage === 1}
                      className="rounded border border-black px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {messagesPagination.page} of {messagesPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setMessagesPage(messagesPage + 1)}
                      disabled={!messagesPagination.hasNextPage}
                      className="rounded border border-black px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Connections (Melt)" />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 rounded-lg border border-black p-4">
          <p className="text-sm text-gray-600">Total Connections</p>
          <p className="text-3xl font-bold">{pagination?.total || 0}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Connections Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading connections...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-black">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">User 1</th>
                    <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">User 2</th>
                    <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Connected On</th>
                    <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Last Message</th>
                    <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No connections found
                      </td>
                    </tr>
                  ) : (
                    connections.map((connection) => (
                      <tr
                        key={connection.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/users?userId=${connection.user1.id}`}
                            className="font-medium hover:underline"
                          >
                            {connection.user1.fullName}
                          </Link>
                          <p className="text-sm text-gray-600">@{connection.user1.username}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/users?userId=${connection.user2.id}`}
                            className="font-medium hover:underline"
                          >
                            {connection.user2.fullName}
                          </Link>
                          <p className="text-sm text-gray-600">@{connection.user2.username}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-1 text-xs capitalize ${
                              connection.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {connection.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatDate(connection.connectedOn)}</td>
                        <td className="px-4 py-3">
                          {connection.lastMessage ? (
                            <div>
                              <p className="max-w-md truncate text-sm">{connection.lastMessage}</p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(connection.lastUpdatedAt)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">No messages</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedConnection(connection)
                              setMessagesPage(1)
                            }}
                            className="flex items-center gap-1 rounded border border-black px-3 py-1 text-sm hover:bg-black hover:text-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                            View Messages
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} connections
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
          </>
        )}
      </div>
    </div>
  )
}

