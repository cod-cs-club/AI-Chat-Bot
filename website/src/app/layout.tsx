import { MainProvider } from '@/contexts/MainContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import './globals.css'

import { Open_Sans } from 'next/font/google'
const mainFont = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Chap-GPT',
  description: 'Get information about College of Dupage with a custom tailored chatbot!',
}

// Root website layout
export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#8bc34a" />
      </head>
      <body className={mainFont.className}>
        <MainProvider>
          {/* <div id="contentBody"> */}
            <Navbar />
            {children}
          {/* </div> */}
          {/* <Footer /> */}
        </MainProvider>
      </body>
    </html>
  )
}
