'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/chat')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-perplexity-bg">
      <div className="w-full max-w-3xl space-y-12 animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-perplexity-accent rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Where knowledge begins</h1>
          <p className="text-lg text-gray-600">Ask anything, get instant answers with cited sources</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="relative bg-white rounded-xl shadow-lg border border-perplexity-border hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-perplexity-accent text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
        </form>

        {/* Example Queries */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'List of top 10 singers, give table',
              'What are the latest AI developments?',
              'Explain quantum computing simply',
              'Best programming languages in 2025'
            ].map((example, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(example)}
                className="text-left p-3 rounded-lg border border-perplexity-border hover:border-perplexity-accent hover:bg-perplexity-hover transition-all duration-200 text-sm group"
              >
                <span className="text-gray-700 group-hover:text-perplexity-accent">{example}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 space-y-2">
          <p>Built with Next.js 14, TypeScript, and TailwindCSS</p>
          <p className="text-xs">Pixel-perfect clone of Perplexity AI • Streaming responses from mock API</p>
        </footer>
      </div>
    </main>
  )
}
