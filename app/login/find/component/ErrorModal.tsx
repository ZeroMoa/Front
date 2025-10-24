'use client'

import React from 'react';
import styles from './ErrorModal.module.css';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <button type="button" onClick={onClose}>확인</button>
            </div>
        </div>
    );
}
