import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Metal Admin Dashboard',
  description: 'Admin dashboard for Metal social networking platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


