'use client'
import { Message as MessageType } from '@/types'
import { useEffect, useState } from 'react'

interface Props {
  message: MessageType
}

export default function Message({ message }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (message.role === 'user') {
    return (
      <div className={`flex justify-end animate-slide-up ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-perplexity-accent text-white px-5 py-3 rounded-2xl max-w-[80%] shadow-sm">
          <p className="text-base leading-relaxed">{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-4 animate-slide-up ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Avatar */}
      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[85%] space-y-4">
        {/* Loading State */}
        {message.loading && !message.text && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-perplexity-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-perplexity-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-perplexity-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Searching the web...</span>
          </div>
        )}

        {/* Plan/Progress */}
        {message.plan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm animate-fade-in">
            <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Searching...</span>
            </div>
            <pre className="text-xs text-blue-600 overflow-hidden">{message.plan}</pre>
          </div>
        )}

        {/* Answer Text */}
        {message.text && (
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
              {message.text}
            </p>
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="bg-white border border-perplexity-border rounded-xl p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-perplexity-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h4 className="font-semibold text-gray-900">Sources</h4>
              <span className="text-xs text-gray-500">({message.sources.length})</span>
            </div>
            <div className="space-y-2">
              {message.sources.slice(0, 9).map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border border-gray-200 hover:border-perplexity-accent hover:bg-perplexity-hover transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600 group-hover:bg-perplexity-accent group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 group-hover:text-perplexity-accent truncate transition-colors">
                        {source.name}
                      </p>
                      {source.snippet && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {source.snippet}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {new URL(source.url).hostname}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-perplexity-accent transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
