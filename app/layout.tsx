import '../styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perplexity Clone - AI-Powered Search',
  description: 'Pixel-perfect Perplexity AI clone with streaming responses'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-perplexity-text antialiased">
        {children}
      </body>
    </html>
  )
}
