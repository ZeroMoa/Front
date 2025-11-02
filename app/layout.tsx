import '../styles/global.css'
// import 'react-quill/dist/quill.snow.css' // Quill 에디터 스타일 (global.css로 이동)
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