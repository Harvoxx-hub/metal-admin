'use client'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-black bg-white p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
    </header>
  )
}


