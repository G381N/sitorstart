'use client'
import { Message as MessageType } from '@/types'
import { useEffect, useState } from 'react'

interface Props {
  message: MessageType
}

// Function to detect and parse table-like content
function parseTableContent(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Simple heuristic: if we have numbered items or rows with consistent structure
  const hasTablePattern = lines.some(line => /^\d+\./.test(line.trim()))
  
  if (!hasTablePattern || lines.length < 3) {
    return null
  }

  // Parse numbered list into table rows
  const rows = lines
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => {
      const match = line.match(/^\d+\.\s*(.+)/)
      return match ? match[1].trim() : line
    })

  if (rows.length === 0) return null

  return rows
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

  const tableRows = message.text ? parseTableContent(message.text) : null

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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                        Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600 font-medium border-r border-gray-200">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
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
