'use client'

import React from 'react';
import MainHeader from '../components/MainHeader';
import LoginModal from '../components/LoginModal';
import { useAppSelector, useAppDispatch } from './store/store';
import { closeLoginModal } from './store/authSlice';

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);

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
