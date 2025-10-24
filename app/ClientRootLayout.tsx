'use client'

import React, { useEffect } from 'react';
import MainHeader from '../components/MainHeader';
import LoginModal from '../components/LoginModal';
import { useAppSelector, useAppDispatch } from './store/store';
import { closeLoginModal, setLoggedIn, setUser } from './store/authSlice';

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
            const storedUser = localStorage.getItem('user');

            if (storedIsLoggedIn === 'true') {
                dispatch(setLoggedIn(true));
            }

            if (storedUser) {
                try {
                    dispatch(setUser(JSON.parse(storedUser)));
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                    dispatch(setUser(null));
                    localStorage.removeItem('user');
                }
            }
        }
    }, [dispatch]);

    const handleCloseLoginModal = () => {
        dispatch(closeLoginModal());
    };

    return (
        <>
            <MainHeader />
            {children}
            <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
        </>
    );
}
