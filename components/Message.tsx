'use client'
import { Message as MessageType } from '@/types'
import { useEffect, useState } from 'react'

interface Props {
  message: MessageType
}

// Function to detect and parse table-like content
function parseTableContent(text: string, isTableRequest: boolean = false) {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Check for numbered list pattern
  const numberedLines = lines.filter(line => /^\d+[\.\)]\s*/.test(line.trim()))
  
  if (numberedLines.length >= 3 || isTableRequest) {
    // Parse numbered list into table rows
    const rows = numberedLines.map(line => {
      const match = line.match(/^\d+[\.\)]\s*(.+)/)
      return match ? match[1].trim() : line.trim()
    })

    if (rows.length > 0) return rows
  }

  // Check for comma-separated or dash-separated lists
  if (isTableRequest && lines.length >= 3) {
    const items = lines.map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    if (items.length >= 3) return items
  }

  return null
}

// Check if the user's query asks for a table
function isTableQuery(userQuery: string): boolean {
  const tableKeywords = ['table', 'list of', 'top 10', 'top 5', 'ranking', 'singers', 'artists']
  return tableKeywords.some(keyword => userQuery.toLowerCase().includes(keyword))
}

export default function Message({ message }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (message.role === 'user') {
    return (
      <div className={`flex justify-start animate-slide-up ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-gray-900 px-0 py-0 max-w-full">
          <p className="text-[17px] leading-relaxed font-medium">{message.text}</p>
        </div>
      </div>
    )
  }

  // Check if this is a table request
  const isTableReq = message.text ? isTableQuery(message.text) : false
  const tableRows = message.text ? parseTableContent(message.text, isTableReq) : null

  return (
    <div className={`flex items-start gap-0 animate-slide-up ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex-1 max-w-full space-y-5">
        {/* Loading State */}
        {message.loading && !message.text && !message.plan && (
          <div className="flex items-center gap-2.5 text-gray-600">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[14px]">Working...</span>
          </div>
        )}

        {/* Plan/Status Updates */}
        {message.plan && (
          <div className="flex items-start gap-2.5 text-gray-600 animate-fade-in">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-[14px] leading-relaxed">{message.plan}</p>
          </div>
        )}

        {/* Answer Text - with table formatting if applicable */}
        {message.text && (
          <div className="max-w-none">
            {tableRows && tableRows.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                        Rank
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Singer / Artist
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {row}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[15px] leading-[1.8] text-gray-900 whitespace-pre-wrap m-0">{message.text}</p>
            )}
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="animate-fade-in space-y-3 pt-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sources</p>
            <div className="grid grid-cols-1 gap-2">
              {message.sources.slice(0, 9).map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-150 border border-transparent hover:border-gray-200"
                >
                  <span className="flex-shrink-0 w-5 h-5 text-gray-500 text-xs flex items-center justify-center font-medium mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-normal text-gray-600 group-hover:text-gray-900 transition-colors line-clamp-1">
                      {source.name}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
