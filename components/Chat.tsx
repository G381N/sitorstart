'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Message from './Message'
import { Message as MessageType, SSEMessage, SSEBlock, Source } from '@/types'

const API_URL = 'https://mock-askperplexity.piyushhhxyz.deno.net'

export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const hasAutoSent = useRef(false)
  const userScrolled = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    const query = searchParams.get('q')
    if (query && !hasAutoSent.current) {
      hasAutoSent.current = true
      setInput(query)
      // Auto-send the query from URL
      setTimeout(() => sendMessage(query), 300)
    }
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

  // Auto-scroll only if user hasn't scrolled up
  useEffect(() => {
    if (!containerRef.current || userScrolled.current) return
    containerRef.current.scrollTo({ 
      top: containerRef.current.scrollHeight, 
      behavior: 'smooth' 
    })
  }, [messages])

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-perplexity-border bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-perplexity-accent rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">Perplexity Clone</h3>
        </div>
        <button
          onClick={newChat}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-perplexity-accent hover:bg-perplexity-hover rounded-lg transition-colors duration-200"
        >
          New chat
        </button>
      </header>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto px-6 py-8 space-y-8 bg-perplexity-bg"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 animate-fade-in">
            <p className="text-lg">Start a conversation...</p>
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      {/* Input Form */}
      <div className="border-t border-perplexity-border p-4 bg-white">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center gap-2 bg-white border border-perplexity-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent px-3 py-2 outline-none text-base"
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="px-5 py-2 bg-perplexity-accent text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isStreaming}
            >
              {isStreaming ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
