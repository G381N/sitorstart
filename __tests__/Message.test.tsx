import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Message from '../components/Message'
import { Message as MessageType } from '../types'

describe('Message Component', () => {
  it('renders user message correctly', () => {
    const userMessage: MessageType = {
      id: '1',
      role: 'user',
      text: 'Hello, world!'
    }

    render(<Message message={userMessage} />)
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()
  })

  it('renders assistant message with sources', () => {
    const assistantMessage: MessageType = {
      id: '2',
      role: 'assistant',
      text: 'Here are the top 10 singers...',
      sources: [
        { name: 'Example Source', url: 'https://example.com' }
      ]
    }

    render(<Message message={assistantMessage} />)
    expect(screen.getByText(/Here are the top 10 singers/)).toBeInTheDocument()
    expect(screen.getByText('Sources')).toBeInTheDocument()
  })

  it('shows loading state for assistant message', () => {
    const loadingMessage: MessageType = {
      id: '3',
      role: 'assistant',
      text: '',
      loading: true
    }

    render(<Message message={loadingMessage} />)
    expect(screen.getByText(/Searching/)).toBeInTheDocument()
  })
})
