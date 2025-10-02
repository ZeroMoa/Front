"use client"

import '../styles/global.css'
import { Providers } from './provider'
// import { useAppSelector, useAppDispatch } from './store/store'; // Redux 훅 import
// import { closeLoginModal } from './store/authSlice'; // closeLoginModal 액션 import

import ClientRootLayout from './ClientRootLayout'; // 수정된 경로

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const dispatch = useAppDispatch(); // RootLayout에서는 Redux 훅 사용 불가
  // const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);

  // const handleCloseLoginModal = () => {
  //   dispatch(closeLoginModal());
  // };

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