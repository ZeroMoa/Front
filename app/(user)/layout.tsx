'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainHeader from '../../components/MainHeader'; // React Query를 사용하는 MainHeader
import LoginModal from '../../components/LoginModal';
import SearchHeader from '../../components/SearchHeader';
import { useAppSelector, useAppDispatch } from './store/slices/store';
import { closeLoginModal, setLoggedIn, setUser } from './store/slices/authSlice';
import { useEffect } from 'react';
import { useIsLoggedIn } from './hooks/useAuth';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch();    
  const authState = useAppSelector((state) => state.auth);
  const isLoginModalOpen = authState.isLoginModalOpen;
  const storedIsLoggedIn = authState.isLoggedIn;
  const storedUser = authState.user;
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn: queryIsLoggedIn, userData, isLoading: authLoading } = useIsLoggedIn();

  const handleCloseLoginModal = () => {
    dispatch(closeLoginModal());
  };

  const shouldRenderSearchHeader = pathname !== '/';

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (queryIsLoggedIn && userData) {
      const nextUser = { id: userData.username, username: userData.username };
      const shouldUpdateUser = !storedUser || storedUser.username !== userData.username;
      if (!storedIsLoggedIn) {
        dispatch(setLoggedIn(true));
      }
      if (shouldUpdateUser) {
        dispatch(setUser(nextUser));
      }
    } else if (storedIsLoggedIn || storedUser) {
      dispatch(setUser(null));
      dispatch(setLoggedIn(false));
    }
  }, [authLoading, queryIsLoggedIn, userData, dispatch, storedIsLoggedIn, storedUser]);

  useEffect(() => {
    if (!pathname || typeof window === 'undefined') return;
    const protectedPrefixes = ['/mypage/profile', '/notifications', '/favorites'];
    const requiresAuth =
      protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (!requiresAuth || authLoading) {
      return;
    }

    if (!queryIsLoggedIn) {
      router.replace('/');
    }
  }, [authLoading, pathname, queryIsLoggedIn, router]);

  return (
    <>
      <MainHeader /> {/* React Query를 사용하는 MainHeader */}
      {shouldRenderSearchHeader && <SearchHeader />}
      <main>{children}</main>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </>
  );
}
