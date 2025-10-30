'use client'

import React from 'react';
import MainHeader from '../components/MainHeader'; // React Query를 사용하는 MainHeader
import LoginModal from '../components/LoginModal';
import { useAppSelector, useAppDispatch } from '../app/store/slices/store';
import { closeLoginModal } from '../app/store/slices/authSlice';

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch();
  const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);

  const handleCloseLoginModal = () => {
    dispatch(closeLoginModal());
  };

  return (
    <>
      <MainHeader /> {/* React Query를 사용하는 MainHeader */}
      <main>{children}</main>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </>
  );
}
