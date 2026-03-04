import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wild Spruce - Premium Natural Solutions',
  description: 'Experience the natural beauty and quality of Wild Spruce. Discover our premium products and services.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
