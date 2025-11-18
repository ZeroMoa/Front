'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainHeader from '../../components/MainHeader'; // React Query를 사용하는 MainHeader
import LoginModal from '../../components/LoginModal';
import SearchHeader from '../../components/SearchHeader';
import { useAppSelector, useAppDispatch } from './store/slices/store';
import { closeLoginModal, selectIsLoggedIn } from './store/slices/authSlice';
import { useEffect } from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch();    
  const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const pathname = usePathname();
  const router = useRouter();

  const handleCloseLoginModal = () => {
    dispatch(closeLoginModal());
  };

  const shouldRenderSearchHeader = pathname !== '/';

  useEffect(() => {
    if (!pathname || typeof window === 'undefined') return;
    const protectedPrefixes = ['/mypage/profile', '/notifications', '/favorites'];
    const requiresAuth = protectedPrefixes.some((prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    const storedLogin = window.localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn && !storedLogin && requiresAuth) {
      router.replace('/');
    }
  }, [isLoggedIn, pathname, router]);

  return (
    <>
      <MainHeader /> {/* React Query를 사용하는 MainHeader */}
      {shouldRenderSearchHeader && <SearchHeader />}
      <main>{children}</main>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </>
  );
}
