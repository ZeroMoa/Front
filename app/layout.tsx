import '../styles/global.css'
// import 'react-quill/dist/quill.snow.css' // Quill 에디터 스타일 (global.css로 이동)
import { Providers } from './provider'
import { getCdnUrl } from '@/lib/cdn'
import Footer from '@/components/Footer'

export const metadata = {
  icons: {
    icon: [
      { url: getCdnUrl('/images/favicon4.png'), rel: 'icon', type: 'image/png', sizes: '32x32' },
      { url: getCdnUrl('/images/favicon4.png'), rel: 'icon', type: 'image/png', sizes: '16x16' },
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
          <Footer />
        </Providers>
      </body>
    </html>
  )
}