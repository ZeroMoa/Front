import '../styles/global.css'
import { Providers } from './provider'
import ClientRootLayout from './ClientRootLayout'; // 수정된 경로

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <ClientRootLayout>{children}</ClientRootLayout>
        </Providers>
      </body>
    </html>
  )
}