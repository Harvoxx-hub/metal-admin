'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const result = await api.adminSignup(formData.email, formData.password, formData.fullName)
      // Only redirect if signup was successful
      if (result && result.data) {
        router.push('/dashboard')
      } else {
        setError('Signup failed. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      // Extract error message
      const errorMessage = err?.message || err?.error || 'Signup failed. Please check your information and try again.'
      setError(errorMessage)
      setLoading(false)
      // Prevent any auto-refresh by not throwing or redirecting here
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Metal Admin</h1>
          <p className="text-gray-600">Create your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-black p-8">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded border border-black bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

