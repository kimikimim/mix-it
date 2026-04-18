'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="text-2xl font-black tracking-tight">
          <span className="text-violet-400">mix</span>
          <span className="text-fuchsia-400">.it</span>
        </div>

        <nav className="flex items-center gap-1 bg-gray-900 rounded-xl p-1">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              pathname === '/'
                ? 'bg-violet-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚗️ Chemical
          </Link>
          <Link
            href="/cooking"
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              pathname === '/cooking'
                ? 'bg-orange-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🍳 Cooking
          </Link>
        </nav>
      </div>
    </header>
  )
}
