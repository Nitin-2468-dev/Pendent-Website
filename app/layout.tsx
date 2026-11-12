import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { BackgroundCubesGrid } from './components/background-cubes-grid'
import { ScalesContainer } from './components/scales'
import { BackgroundBeams } from './components/background-beams';
import { BackgroundRippleEffect } from "./components/background-ripple-effect";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Next.js Portfolio Starter',
    template: '%s | Next.js Portfolio Starter',
  },
  description: 'This is my portfolio.',
  openGraph: {
    title: 'My Portfolio',
    description: 'This is my portfolio.',
    url: baseUrl,
    siteName: 'My Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >      
    <body className="antialiased">
      {/* <ScalesContainer
        orientation="diagonal"
        size={12}
        color="rgba(56, 207, 195, 0.12)"
        className="pointer-events-none"
        containerClassName="relative isolate min-h-screen w-full overflow-hidden bg-white dark:bg-black"
      > */}
      <BackgroundRippleEffect/>
        <main className="relative z-10 mx-4 mt-14 flex w-auto max-w-4xl  min-w-0 flex-col px-2 lg:mx-auto">
          
          <Navbar />
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />
        </main>
      {/* </ScalesContainer> */}
      {/* <BackgroundBeams/> */}
    </body>

    </html>
  )
}


