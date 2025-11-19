export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  loading?: boolean
  plan?: string | null
  sources?: Source[]
  searchSteps?: SearchStep[]
}

export interface Source {
  name: string
  url: string
  snippet?: string
}

export interface SearchStep {
  type: 'search' | 'crawling' | 'analyzing'
  description: string
  status: 'in-progress' | 'completed'
}

export interface SSEBlock {
  intended_usage?: string
  diff_block?: {
    field?: string
    patches?: Array<{
      op: string
      path: string
      value: any
    }>
  }
  plan_block?: any
  web_result_block?: any
}

export interface SSEMessage {
  blocks?: SSEBlock[]
  text?: string
  answer_text?: string
  status?: string
  final_sse_message?: boolean
}
