"use client"

import MainHeader from '../components/MainHeader'
import '../styles/global.css'
import { Providers } from './provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="ko">
      <body>
        <Providers>
          <MainHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}