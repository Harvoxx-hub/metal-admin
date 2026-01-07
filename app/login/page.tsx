'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await api.adminLogin(email, password)
      // Only redirect if login was successful
      if (result && result.data) {
        router.push('/dashboard')
      } else {
        setError('Login failed. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      // Extract error message
      const errorMessage = err?.message || err?.error || 'Login failed. Please check your credentials and try again.'
      setError(errorMessage)
      setLoading(false)
      // Prevent any auto-refresh by not throwing or redirecting here
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Metal Admin</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-black p-8">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="admin@metal.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

              {error && (
            <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/signup" className="font-medium underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

