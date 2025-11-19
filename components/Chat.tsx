'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Message from './Message'
import { Message as MessageType, SSEMessage, SSEBlock, Source } from '@/types'

const API_URL = 'https://mock-askperplexity.piyushhhxyz.deno.net'

export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasAutoSent = useRef(false)
  const userScrolled = useRef(false)
  const latestMessageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const query = searchParams.get('q')
    if (query && !hasAutoSent.current) {
      hasAutoSent.current = true
      setInput(query)
      // Auto-send the query from URL
      setTimeout(() => sendMessage(query), 300)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Track user scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      userScrolled.current = !isAtBottom
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll: new message appears at top of viewport (Perplexity behavior)
  useEffect(() => {
    if (!containerRef.current || !latestMessageRef.current || userScrolled.current) return
    
    // Calculate scroll position to put latest message at top of viewport
    const container = containerRef.current
    const latestMsg = latestMessageRef.current
    const scrollTarget = latestMsg.offsetTop - 100 // 100px from top
    
    container.scrollTo({ 
      top: scrollTarget, 
      behavior: 'smooth' 
    })
    
    // Reset scroll tracking after auto-scroll
    setTimeout(() => {
      userScrolled.current = false
    }, 1000)
  }, [messages.length])

  const newChat = useCallback(() => {
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }, [])

  const appendToAssistant = useCallback((id: string, chunk: string) => {
    const words = chunk.split(/(\s+)/)
    let i = 0
    
    const step = () => {
      if (i >= words.length) return
      const piece = words[i]
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: m.text + piece } : m))
      )
      i++
      setTimeout(step, 30)
    }
    step()
  }, [])

  const handleSSEObject = useCallback((obj: SSEMessage, assistantId: string) => {
    // Filter out metadata/debugging objects (step_type objects)
    if ((obj as any).step_type) {
      return // Skip these - they're internal metadata
    }

    if (obj.blocks && Array.isArray(obj.blocks)) {
      for (const b of obj.blocks) {
        // Handle plan updates
        if (b.intended_usage === 'plan' || b.intended_usage === 'pro_search_steps') {
          const planPatch = b.diff_block || b.plan_block || b
          // Extract human-readable text from plan
          let planText = ''
          try {
            if (planPatch.text) planText = planPatch.text
            else if (planPatch.patches?.[0]?.value?.text) planText = planPatch.patches[0].value.text
            else if (planPatch.description) planText = planPatch.description
          } catch (e) {
            console.error('Error parsing plan:', e)
          }
          
          if (planText) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, plan: planText }
                  : m
              )
            )
          }
        }

        // Handle web results/sources
        if (
          b.intended_usage === 'web_results' ||
          b.intended_usage === 'sources_answer_mode' ||
          (b.diff_block && b.diff_block.field === 'web_result_block')
        ) {
          const web = 
            b.diff_block?.patches?.[0]?.value?.web_results ||
            b.diff_block?.patches?.[0]?.value ||
            b
          
          const urls: Source[] = []
          try {
            const candidates = (web.web_results || web) || []
            for (const r of candidates) {
              if (r.url) {
                urls.push({
                  name: r.name || r.title || r.url,
                  url: r.url,
                  snippet: r.snippet
                })
              }
            }
          } catch (e) {
            console.error('Error parsing sources:', e)
          }

          if (urls.length) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, sources: [...(m.sources || []), ...urls] }
                  : m
              )
            )
          }
        }
      }
    }

    // Append text content
    if (obj.text || obj.answer_text) {
      appendToAssistant(assistantId, ' ' + (obj.text || obj.answer_text || ''))
    }
  }, [appendToAssistant])

  const finishAssistant = useCallback((id: string, sources?: Source[]) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            loading: false,
            sources: sources || m.sources || []
          }
        }
        return m
      })
    )
    setIsStreaming(false)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    // Reset scroll tracking for new message
    userScrolled.current = false

    const userMsg: MessageType = {
      id: Date.now() + '-u',
      role: 'user',
      text: text.trim()
    }
    setMessages((m) => [...m, userMsg])
    setInput('')

    const assistantMsg: MessageType = {
      id: Date.now() + '-a',
      role: 'assistant',
      text: '',
      loading: true,
      plan: null,
      sources: []
    }
    setMessages((m) => [...m, assistantMsg])
    setIsStreaming(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      })

      if (!res.body) {
        const body = await res.text()
        appendToAssistant(assistantMsg.id, '\n' + body)
        finishAssistant(assistantMsg.id)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let buffer = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true })
        buffer += chunk

        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n').map((l) => l.trim())
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.replace(/^data:\s*/, '')
              if (!jsonStr || jsonStr === '[DONE]') continue
              try {
                const obj: SSEMessage = JSON.parse(jsonStr)
                handleSSEObject(obj, assistantMsg.id)
              } catch (e) {
                // Not JSON, append as-is
                appendToAssistant(assistantMsg.id, '\n' + jsonStr)
              }
            }
          }
        }
      }

      if (buffer) {
        const b = buffer.trim()
        if (b.startsWith('data:')) {
          const jsonStr = b.replace(/^data:\s*/, '')
          try {
            const obj: SSEMessage = JSON.parse(jsonStr)
            handleSSEObject(obj, assistantMsg.id)
          } catch (e) {
            appendToAssistant(assistantMsg.id, '\n' + jsonStr)
          }
        } else {
          appendToAssistant(assistantMsg.id, '\n' + b)
        }
      }

      finishAssistant(assistantMsg.id)
    } catch (err) {
      appendToAssistant(assistantMsg.id, '\n[Error] ' + String(err))
      finishAssistant(assistantMsg.id)
    }
  }, [isStreaming, appendToAssistant, handleSSEObject, finishAssistant])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isStreaming) return
    sendMessage(input || 'list of top 10 singers, give table')
  }

  return (
    <div className="h-full flex bg-white">
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

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r border-gray-200 bg-gray-50 transition-all duration-300 flex flex-col`}>
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium text-gray-700">Menu</span>}
          </button>
        </div>
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-md transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span className="text-sm text-gray-600 group-hover:text-gray-700">New Thread</span>}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-auto">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-md transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sidebarOpen && <span className="text-sm text-gray-600 group-hover:text-gray-700">Home</span>}
          </button>
          <button className="w-full flex items-center gap-3 p-2.5 bg-gray-100 text-gray-700 rounded-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Discover</span>}
          </button>
          <button className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-md transition-colors group">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {sidebarOpen && <span className="text-sm text-gray-600 group-hover:text-gray-700">Spaces</span>}
          </button>
        </nav>
        <div className="p-2 border-t border-gray-200 space-y-1">
          <button className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-md transition-colors group">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {sidebarOpen && <span className="text-sm text-gray-600 group-hover:text-gray-700">Account</span>}
          </button>
          <button className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-md transition-colors group relative">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {sidebarOpen && <span className="text-sm text-gray-600 group-hover:text-gray-700">Upgrade</span>}
            {!sidebarOpen && <span className="absolute left-10 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#20808D"/>
                <path d="M2 17L12 22L22 17" stroke="#20808D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#20808D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <button className="text-xs text-[#20808D] hover:text-[#1A6B77] font-medium transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </header>

        {/* Messages */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-white"
        >
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-12">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 animate-fade-in pt-20">
                <p className="text-base">Start a conversation...</p>
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={m.id} ref={idx === messages.length - 1 ? latestMessageRef : null}>
                <Message message={m} />
              </div>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-center gap-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus-within:border-[#20808D] transition-all px-4 py-3 shadow-sm">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up..."
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[15px]"
                disabled={isStreaming}
              />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowComingSoon(true)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button type="button" onClick={() => setShowComingSoon(true)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button type="button" onClick={() => setShowComingSoon(true)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button type="button" onClick={() => setShowComingSoon(true)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="p-1.5 bg-[#20808D] hover:bg-[#1A6B77] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isStreaming}
                >
                  {isStreaming ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
