'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '../app/(user)/store/slices/store'; // Redux dispatch 사용을 위해 import
import styles from './LoginModal.module.css'
import { setLoggedIn, setUser } from '../app/(user)/store/slices/authSlice'; // 로그인 상태 업데이트 액션 import
import { useQueryClient } from '@tanstack/react-query'; // useQueryClient import
import { getCdnUrl } from '@/lib/cdn'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:8443').replace(/\/$/, '');
type SocialProvider = 'google' | 'naver';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null); // 로그인 에러 메시지 상태 추가

    // 비밀번호 가시성 상태 추가
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const dispatch = useAppDispatch(); // dispatch 초기화
    const queryClient = useQueryClient(); // queryClient 초기화

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => { // async로 변경
        e.preventDefault();
        setLoginError(null); // 로그인 시도 시 에러 메시지 초기화

        try {
            const response = await fetch(`${API_BASE_URL}/login`, { // URL 수정: /user/login -> /login
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, autoLogin }),
                credentials: 'include', // 이 줄을 추가했습니다.
            });

            if (!response.ok) {
                let errorData = { message: response.statusText || '로그인 실패: 서버 응답 오류' }; // 기본 오류 메시지를 statusText로 설정
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (jsonError) {
                        console.error('응답 JSON 파싱 실패:', jsonError);
                        // JSON 파싱 실패 시, 이미 statusText로 기본 메시지가 설정되어 있음
                    }
                }
                setLoginError(errorData.message || '로그인 실패: 알 수 없는 오류'); // errorData.message가 비어있을 경우를 대비
                return;
            }

            const userData = await response.json();

            // Redux 상태 업데이트
            dispatch(setLoggedIn(true));
            dispatch(setUser({ id: userData.id, username: userData.username }));

            // React Query 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['user'] });

            let redirectTarget = '/';
            if (typeof window !== 'undefined') {
                const { pathname, search, hash } = window.location;
                const next = `${pathname || ''}${search || ''}${hash || ''}`;
                redirectTarget = next && next !== '' ? next : '/';
            }

            onClose(); // 모달 닫기
            router.replace(redirectTarget); // 현재 페이지 유지

        } catch (error) {
            setLoginError('네트워크 오류 또는 서버 응답 없음');
        }
    };

    const handleSocialLogin = (provider: SocialProvider) => {
        if (typeof window === 'undefined') {
            setLoginError('브라우저 환경에서만 소셜 로그인을 사용할 수 있습니다.');
            return;
        }

        const targetUrl = `${API_BASE_URL}/oauth2/authorization/${provider}`;
        try {
            window.location.href = targetUrl;
        } catch (error) {
            console.error('소셜 로그인 리다이렉트 실패:', error);
            setLoginError('소셜 로그인 페이지로 이동하지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleSignup = () => {
        onClose(); // 모달 닫기
        router.push('/login/join'); // 회원가입 페이지로 이동
    };

    const handleFindNavigation = (path: string) => {
        onClose();
        if (typeof window !== 'undefined') {
            window.location.assign(path);
        } else {
            router.push(path);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* 모달 바깥 클릭 시 닫히도록 */}
                <button className={styles.closeButton} onClick={onClose}>×</button>
                
                <div className={styles.logoContainer}>
                    <Image 
                        src={getCdnUrl('/images/logo.png')} 
                        alt="제로모아 로고" 
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
                        <div className={styles.inputFieldContainer}> {/* inputFieldContainer로 감싸기 */}
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                id="password" 
                                className={styles.inputField}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle} /* 새로운 스타일 클래스 */
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                            >
                                <Image
                                    src={getCdnUrl(showPassword ? '/images/open_eye.png' : '/images/closed_eye.png')}
                                    alt={showPassword ? '비밀번호 숨김 아이콘' : '비밀번호 보이기 아이콘'}
                                    width={20}
                                    height={20}
                                />
                            </button>
                        </div>
                    </div>
                    {loginError && <p className={styles.errorMessage}>{loginError}</p>} {/* 에러 메시지 표시 */}

                    <div className={styles.optionsContainer}>
                        <label className={styles.autoLogin}>
                            <input 
                                type="checkbox" 
                                checked={autoLogin}
                                onChange={(e) => setAutoLogin(e.target.checked)}
                            />
                            자동 로그인
                        </label>
                        <Link
                            href="/login/find/id"
                            className={styles.findLinks}
                            onClick={(e) => {
                                e.preventDefault();
                                handleFindNavigation('/login/find/id');
                            }}
                        >
                            아이디찾기
                        </Link>
                        <span className={styles.separator}>|</span>
                        <Link
                            href="/login/find/pw"
                            className={styles.findLinks}
                            onClick={(e) => {
                                e.preventDefault();
                                handleFindNavigation('/login/find/pw');
                            }}
                        >
                            비밀번호 찾기
                        </Link>
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

                <div className={styles.sectionDivider} aria-hidden="true" />

                <p className={styles.socialLoginTitle}>간편 로그인</p>
                <div className={styles.socialIcons}>
                    <div className={styles.socialIconContainer} onClick={() => handleSocialLogin('google')}>
                        <Image src={getCdnUrl('/images/google.png')} alt="Google" width={20} height={20} className={styles.socialIcon} />
                    </div>
                    <div className={styles.socialIconContainer} onClick={() => handleSocialLogin('naver')}>
                        <Image src={getCdnUrl('/images/naver.png')} alt="Naver" width={20} height={20} className={styles.socialIcon} />
                    </div>
                </div>
            </div>
        </div>
    );
}
