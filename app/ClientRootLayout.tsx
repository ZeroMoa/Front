'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import MainHeader from '../components/MainHeader'; // React Query를 사용하는 MainHeader
import LoginModal from '../components/LoginModal';
import SearchHeader from '../components/SearchHeader';
import { useAppSelector, useAppDispatch } from '../app/store/slices/store';
import { closeLoginModal } from '../app/store/slices/authSlice';

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch();
  const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);
  const pathname = usePathname();

  const handleCloseLoginModal = () => {
    dispatch(closeLoginModal());
  };

  const shouldRenderSearchHeader = pathname !== '/';

  return (
    <>
      <MainHeader /> {/* React Query를 사용하는 MainHeader */}
      {shouldRenderSearchHeader && <SearchHeader />}
      <main>{children}</main>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </>
  );
}
