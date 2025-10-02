'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './LoginModal.module.css'

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('로그인 시도:', { username, password, autoLogin });
        // 여기에 실제 로그인 API 호출 로직 구현
        // 로그인 성공 시 onClose();
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`${provider} 소셜 로그인 시도`);
        // 여기에 각 소셜 로그인 제공업체별 로직 구현
    };

    const handleSignup = () => {
        onClose(); // 모달 닫기
        router.push('/join'); // 회원가입 페이지로 이동
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* 모달 바깥 클릭 시 닫히도록 */}
                <button className={styles.closeButton} onClick={onClose}>×</button>
                
                <div className={styles.logoContainer}>
                    <Image 
                        src="/images/logo.png" 
                        alt="YANGPA 로고" 
                        width={486} 
                        height={171} 
                        priority
                        className={styles.logo}
                    />
                </div>

                <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">아이디</label>
                        <input 
                            type="text" 
                            id="username" 
                            className={styles.inputField}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            className={styles.inputField}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.optionsContainer}>
                        <label className={styles.autoLogin}>
                            <input 
                                type="checkbox" 
                                checked={autoLogin}
                                onChange={(e) => setAutoLogin(e.target.checked)}
                            />
                            자동 로그인
                        </label>
                        <Link href="/login/find-id" className={styles.findLinks} onClick={onClose}>아이디찾기</Link> 
                        / 
                        <Link href="/login/find-pw" className={styles.findLinks} onClick={onClose}>비밀번호 찾기</Link>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="button" className={`${styles.button} ${styles.signupButton}`} onClick={handleSignup}>
                            회원가입
                        </button>
                        <button type="submit" className={`${styles.button} ${styles.loginButton}`}>
                            로그인
                        </button>
                    </div>
                </form>

                <p className={styles.socialLoginTitle}>간편 로그인</p>
                <div className={styles.socialIcons}>
                    <div className={styles.socialIconContainer} onClick={() => handleSocialLogin('Google')}>
                        <Image src="/images/google.png" alt="Google" width={40} height={40} className={styles.socialIcon} />
                    </div>
                    <div className={styles.socialIconContainer} onClick={() => handleSocialLogin('Naver')}>
                        <Image src="/images/naver.png" alt="Naver" width={40} height={40} className={styles.socialIcon} />
                    </div>
                </div>
            </div>
        </div>
    );
}
