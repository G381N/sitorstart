import '../styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perplexity',
  description: 'Where knowledge begins',
  icons: {
    icon: '/download.jpeg',
    shortcut: '/download.jpeg',
    apple: '/download.jpeg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
