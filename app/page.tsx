'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [query, setQuery] = useState('')
  const [showComingSoon, setShowComingSoon] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/chat')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/chat?q=${encodeURIComponent(suggestion)}`)
  }

  const suggestions = [
    "List of top 10 singers, give table",
    "What are the latest AI developments?",
    "Explain quantum computing simply",
    "Best programming languages in 2025"
  ]

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowComingSoon(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#20808D] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#20808D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Coming Soon</h3>
            <p className="text-sm text-gray-600 text-center mb-6">This feature is currently under development and will be available soon.</p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full px-4 py-2 bg-[#20808D] hover:bg-[#1A6B77] text-white rounded-md transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#20808D"/>
                <path d="M2 17L12 22L22 17" stroke="#20808D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#20808D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign In</button>
            <button className="px-4 py-1.5 bg-[#20808D] hover:bg-[#1A6B77] text-white text-sm font-medium rounded-md transition-colors">
              Try Pro
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {/* Perplexity Title */}
          <h1 className="text-5xl font-normal text-gray-900 text-center mb-8 tracking-tight">
            perplexity
          </h1>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative mb-8">
            <div className="relative bg-white rounded-lg border border-gray-300 hover:border-gray-400 focus-within:border-[#20808D] transition-all shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[15px]"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowComingSoon(true)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => setShowComingSoon(true)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    className="p-1.5 bg-[#20808D] hover:bg-[#1A6B77] rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Try Asking Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Try asking:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all group"
                >
                  <p className="text-sm text-gray-700 group-hover:text-gray-900">
                    {suggestion}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
