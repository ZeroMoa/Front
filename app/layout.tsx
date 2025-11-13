import '../styles/global.css'
// import 'react-quill/dist/quill.snow.css' // Quill 에디터 스타일 (global.css로 이동)
import { Providers } from './provider'

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', rel: 'icon' },
      { url: '/favicon-16x16.png', rel: 'icon', type: 'image/png', sizes: '16x16' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}