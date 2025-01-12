import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Header from '@/components/Header'
import Link from 'next/link'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import '../styles/rainbowkit.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cross-Chain Token Swap',
  description: 'Easily swap tokens across different blockchains',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="container mx-auto px-4 py-4 text-center">
              <Link href="/admin" className="text-blue-500 hover:underline">
                Admin Dashboard
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}

