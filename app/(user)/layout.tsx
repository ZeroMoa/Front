'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainHeader from '../../components/MainHeader'; // React Query를 사용하는 MainHeader
import LoginModal from '../../components/LoginModal';
import SearchHeader from '../../components/SearchHeader';
import { useAppSelector, useAppDispatch } from './store/slices/store';
import { closeLoginModal, setLoggedIn, setUser } from './store/slices/authSlice';
import { useEffect, useRef } from 'react';
import { useIsLoggedIn } from './hooks/useAuth';
import { useUserLogout } from './hooks/useUserLogout';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch();    
  const { isLoginModalOpen } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn: queryIsLoggedIn, userData, isLoading: authLoading } = useIsLoggedIn();
  const logoutUser = useUserLogout();

  const handleCloseLoginModal = () => {
    dispatch(closeLoginModal());
  };

  const shouldRenderSearchHeader = pathname !== '/';

  const lastSyncedUserRef = useRef<{ id: string; username: string } | null>(null);
  const lastSyncedLoggedInRef = useRef(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (queryIsLoggedIn && userData) {
      const nextUser = { id: userData.username, username: userData.username };
      const shouldUpdateUser =
        !lastSyncedUserRef.current || lastSyncedUserRef.current.username !== nextUser.username;

      if (!lastSyncedLoggedInRef.current) {
        dispatch(setLoggedIn(true));
        lastSyncedLoggedInRef.current = true;
      }

      if (shouldUpdateUser) {
        dispatch(setUser(nextUser));
        lastSyncedUserRef.current = nextUser;
      }
    } else if (lastSyncedLoggedInRef.current || lastSyncedUserRef.current) {
      dispatch(setUser(null));
      dispatch(setLoggedIn(false));
      lastSyncedLoggedInRef.current = false;
      lastSyncedUserRef.current = null;
    }
  }, [authLoading, queryIsLoggedIn, userData, dispatch]);

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

  useEffect(() => {
    if (authLoading || !pathname) {
      return;
    }
    if (!queryIsLoggedIn) {
      return;
    }

    const isJoinPage = pathname.startsWith('/login/join');
    const isRecoveryPage = pathname.startsWith('/login/find');

    if (isJoinPage || isRecoveryPage) {
      if (isLoginModalOpen) {
        dispatch(closeLoginModal());
      }
      router.replace('/');
      return;
    }

    if (pathname.startsWith('/login')) {
      void logoutUser({ forceRedirectTo: '/' });
    }
  }, [authLoading, pathname, queryIsLoggedIn, logoutUser, router, dispatch, isLoginModalOpen]);

  return (
    <>
      <MainHeader /> {/* React Query를 사용하는 MainHeader */}
      {shouldRenderSearchHeader && <SearchHeader />}
      <main>{children}</main>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
    </>
  );
}
