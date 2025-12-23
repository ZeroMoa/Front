'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../../store/slices/store';
import { openLoginModal } from '../../../store/slices/authSlice';
import styles from './page.module.css'; // 이 페이지 전용 CSS
import ErrorModal from '../../find/component/ErrorModal'; // 공통 모달 임포트 경로 수정
import {
    InitiatePasswordResetResponse,
} from '@/types/authTypes';
import { initiatePasswordReset, resetUserPassword } from '../../../store/api/userAuthApi';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/cdn';

const EMAIL_DOMAINS = [
    'naver.com',
    'gmail.com',
    'hanmail.net',
    'nate.com',
    'hotmail.com',
    'daum.net',
    'outlook.com',
    'kakao.com',
];
const RESET_TOKEN_DURATION_SECONDS = 300; // 5분
const NETWORK_ERROR_MESSAGE = '서버와 연결이 끊어졌습니다.';
const PASSWORD_NOT_FOUND_MESSAGE = '아이디나 이메일을 잘못입력하셨습니다.';

const extractErrorMessage = (rawError: unknown): string => {
    if (typeof rawError === 'string') {
        return rawError;
    }
    if (typeof rawError === 'object' && rawError !== null) {
        if ('message' in rawError && typeof (rawError as { message?: unknown }).message === 'string') {
            return (rawError as { message?: string }).message as string;
        }
        if ('message' in rawError) {
            return String((rawError as { message?: unknown }).message);
        }
    }
    return '';
};

const mapPasswordInitiateError = (error: unknown): string => {
    const rawMessage = extractErrorMessage(error);
    if (!rawMessage) {
        return '비밀번호 찾기 중 오류가 발생했습니다.';
    }
    if (rawMessage.includes('Failed to fetch')) {
        return NETWORK_ERROR_MESSAGE;
    }
    if (/올바른 형식의 이메일 주소|Email\.|Email\b|\bemail\b|이메일/i.test(rawMessage)) {
        return '잘못된 이메일 형식입니다.';
    }
    if (rawMessage.includes('인증 자격')) {
        return PASSWORD_NOT_FOUND_MESSAGE;
    }
    return rawMessage || '비밀번호 찾기 중 오류가 발생했습니다.';
};

const mapPasswordResetError = (error: unknown): string => {
    const rawMessage = extractErrorMessage(error);
    if (rawMessage.includes('Failed to fetch')) {
        return NETWORK_ERROR_MESSAGE;
    }
    return rawMessage || '비밀번호 재설정 중 오류가 발생했습니다.';
};

export default function FindPasswordPage() {
    const dispatch = useAppDispatch();

    // 비밀번호 찾기 (초기화 시작) 관련 상태
    const [findPwUsername, setFindPwUsername] = useState('');
    const [emailFront, setEmailFront] = useState('');
    const [emailBack, setEmailBack] = useState('');
    const [showEmailDomainSelect, setShowEmailDomainSelect] = useState(false);
    const [isEmailDirectInput, setIsEmailDirectInput] = useState(false);
    const emailDropdownRef = useRef<HTMLDivElement | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null); // 비밀번호 재설정 토큰
    const [findPwStep, setFindPwStep] = useState<1 | 2 | 3>(1); // 1: 정보 입력, 2: 새 비밀번호 입력, 3: 완료
    const [secondsRemaining, setSecondsRemaining] = useState(RESET_TOKEN_DURATION_SECONDS);
    const [expirationTimestamp, setExpirationTimestamp] = useState<number | null>(null);

    // 비밀번호 재설정 관련 상태
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false); // 비밀번호 불일치 에러 상태
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [initiateSuccessMessage, setInitiateSuccessMessage] = useState<string | null>(null);
    const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

    // 공통 오류 모달 상태
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // 공통 오류 모달 열기 함수
    const openErrorModal = (message: string) => {
        setErrorMessage(message);
        setIsErrorModalOpen(true);
    };

    // 공통 오류 모달 닫기 함수
    const closeErrorModal = () => {
        setIsErrorModalOpen(false);
        setErrorMessage('');
    };

    useEffect(() => {
        if (!showEmailDomainSelect) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target as Node)) {
                setShowEmailDomainSelect(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmailDomainSelect]);

const handleTokenExpiration = useCallback(() => {
        setResetToken(null);
        setExpirationTimestamp(null);
        setFindPwStep(1);
        setErrorMessage('비밀번호 재설정 시간이 지났습니다.\n처음부터 다시 진행해 주세요.');
        setIsErrorModalOpen(true);
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (findPwStep === 2 && expirationTimestamp !== null) {
            const updateRemaining = () => {
                setSecondsRemaining(() => {
                    const remainingMs = expirationTimestamp - Date.now();
                    if (remainingMs <= 0) {
                        if (intervalId) {
                            clearInterval(intervalId);
                        }
                        handleTokenExpiration();
                        return 0;
                    }
                    return Math.max(0, Math.ceil(remainingMs / 1000));
                });
            };

            updateRemaining();
            intervalId = setInterval(updateRemaining, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [findPwStep, expirationTimestamp, handleTokenExpiration]);

    useEffect(() => {
        if (findPwStep === 2 && expirationTimestamp !== null && expirationTimestamp <= Date.now()) {
            handleTokenExpiration();
        }
    }, [findPwStep, expirationTimestamp, handleTokenExpiration]);

    // 비밀번호 초기화 시작 API 호출
    const handleInitiatePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedFront = emailFront.trim();
        const trimmedBack = emailBack.trim();
        if (!trimmedFront || !trimmedBack) {
            openErrorModal('이메일을 완전하게 입력해 주세요.');
            return;
        }

        try {
            const data: InitiatePasswordResetResponse = await initiatePasswordReset({
                username: findPwUsername,
                email: `${trimmedFront}@${trimmedBack}`,
            });
            setResetToken(data.resetToken); // 토큰 저장
            setResetSuccessMessage(null);
            const expiresAt = Date.now() + RESET_TOKEN_DURATION_SECONDS * 1000;
            setExpirationTimestamp(expiresAt);
            setSecondsRemaining(RESET_TOKEN_DURATION_SECONDS);
            setFindPwStep(2); // 비밀번호 재설정 폼으로 전환
        } catch (error: any) {
            openErrorModal(mapPasswordInitiateError(error));
        }
    };

    // 비밀번호 재설정 완료 API 호출
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resetToken) {
            openErrorModal('비밀번호 재설정 시간이 지났습니다. 처음부터 다시 진행해 주세요.');
            setFindPwStep(1);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordMismatchError(true);
            openErrorModal('비밀번호가 일치하지 않습니다.');
            return;
        }
        setPasswordMismatchError(false);

        try {
            const response: { message?: string } | undefined = await resetUserPassword({
                resetToken,
                password: newPassword,
            });
            setResetSuccessMessage(response?.message || '비밀번호가 성공적으로 재설정되었습니다.');
            setNewPassword('');
            setConfirmNewPassword('');
            setResetToken(null);
            setExpirationTimestamp(null);
            setFindPwStep(3);
        } catch (error: any) {
            console.error('비밀번호 재설정 요청 중 오류 발생:', error);
            openErrorModal(mapPasswordResetError(error));
        }
    };

    const handleLoginOpen = () => {
        dispatch(openLoginModal());
    };

    const currentRemainingSeconds =
        expirationTimestamp !== null
            ? Math.max(0, Math.ceil((expirationTimestamp - Date.now()) / 1000))
            : secondsRemaining;

    const formattedTimer = `${String(Math.floor(currentRemainingSeconds / 60)).padStart(2, '0')}:${String(
        currentRemainingSeconds % 60
    ).padStart(2, '0')}`;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>비밀번호 찾기</h2>
                <div className={styles.sectionDivider} aria-hidden="true" />

                {/* 비밀번호 찾기 (초기화 시작) 내용 */}
                <div className={styles.tabContent}>
                    {findPwStep === 1 && (
                        <form onSubmit={handleInitiatePasswordReset} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="findPwUsername">아이디</label>
                                <input
                                    type="text"
                                    id="findPwUsername"
                                    className={styles.inputField}
                                    placeholder="아이디를 입력해 주세요"
                                    value={findPwUsername}
                                    onChange={(e) => setFindPwUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="findPwEmail">이메일</label>
                                <div className={styles.boxEmail}>
                                    <div className={`${styles.boxInput} ${emailFront ? styles.hasValue : ''}`}>
                                        <input
                                            type="text"
                                            id="findPwEmail"
                                            className={`${styles.inputInfo} ${styles.emailInput}`}
                                            placeholder="이메일 앞자리 입력"
                                            value={emailFront}
                                            onChange={(e) => setEmailFront(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className={styles.textAt}>@</div>
                                    <div ref={emailDropdownRef} className={styles.boxSelect}>
                                        {isEmailDirectInput ? (
                                            <input
                                                type="text"
                                                className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainInputField} ${
                                                    emailBack ? styles.hasValue : ''
                                                }`}
                                                placeholder="직접 입력"
                                                value={emailBack}
                                                onChange={(e) => setEmailBack(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                required
                                            />
                                        ) : (
                                            <div
                                                className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainDisplayField} ${
                                                    emailBack ? styles.hasValue : ''
                                                }`}
                                            >
                                                {emailBack || '선택해주세요.'}
                                            </div>
                                        )}
                                        <div
                                            className={styles.selectArrowContainer}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowEmailDomainSelect((prev) => !prev);
                                            }}
                                        >
                                            <span className={styles.selectArrow}>{showEmailDomainSelect ? '▲' : '▼'}</span>
                                        </div>
                                        <div className={styles.boxLayer} style={{ display: showEmailDomainSelect ? 'block' : 'none' }}>
                                            <ul className={styles.listAdress}>
                                                <li className={styles.listItem}>
                                                    <button
                                                        type="button"
                                                        className={styles.buttonMail}
                                                        onClick={() => {
                                                            setEmailBack('');
                                                            setIsEmailDirectInput(true);
                                                            setShowEmailDomainSelect(false);
                                                        }}
                                                    >
                                                        직접입력
                                                    </button>
                                                </li>
                                                {EMAIL_DOMAINS.map((domain) => (
                                                    <li key={domain} className={styles.listItem}>
                                                        <button
                                                            type="button"
                                                            className={styles.buttonMail}
                                                            onClick={() => {
                                                                setEmailBack(domain);
                                                                setIsEmailDirectInput(false);
                                                                setShowEmailDomainSelect(false);
                                                            }}
                                                        >
                                                            {domain}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className={styles.confirmButton}>확인</button>
                        </form>
                    )}

                    {findPwStep === 2 && (
                        
                        <form onSubmit={handleResetPassword} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {initiateSuccessMessage && (
                                <p className={styles.resultSubMessage}>{initiateSuccessMessage}</p>
                            )}
                            <div className={styles.timerRow}>
                                <span className={styles.timerLabel}>재설정 유효시간</span>
                                <span className={styles.timerValue}>{formattedTimer}</span>
                            </div>
                            <div className={styles.sectionDivider} aria-hidden="true" />

                            <div className={styles.inputGroup}>
                                <label htmlFor="newPassword">새 비밀번호 등록</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id="newPassword"
                                        className={`${styles.inputField} ${passwordMismatchError ? styles.errorBorder : ''}`}
                                        placeholder="새 비밀번호를 입력해 주세요"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (confirmNewPassword && e.target.value !== confirmNewPassword) {
                                                setPasswordMismatchError(true);
                                            } else {
                                                setPasswordMismatchError(false);
                                            }
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                    >
                                        <Image
                                            src={getCdnUrl(showNewPassword ? '/images/open_eye.png' : '/images/closed_eye.png')}
                                            alt={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                            width={20}
                                            height={20}
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmNewPassword"
                                        className={`${styles.inputField} ${passwordMismatchError ? styles.errorBorder : ''}`}
                                        placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                                        value={confirmNewPassword}
                                        onChange={(e) => {
                                            setConfirmNewPassword(e.target.value);
                                            if (newPassword && e.target.value !== newPassword) {
                                                setPasswordMismatchError(true);
                                            } else {
                                                setPasswordMismatchError(false);
                                            }
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                    >
                                        <Image
                                            src={getCdnUrl(showConfirmPassword ? '/images/open_eye.png' : '/images/closed_eye.png')}
                                            alt={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                            width={20}
                                            height={20}
                                        />
                                    </button>
                                </div>
                                {passwordMismatchError && (
                                    <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
                                )}
                            </div>
                            <button type="submit" className={styles.confirmButton}>확인</button>
                        </form>
                    )}

                    {findPwStep === 3 && (
                        <div className={styles.resultContainer}>
                            <p className={styles.resultMessage}>비밀번호 재설정이 완료되었습니다.</p>
                            <p className={styles.resultSubMessage}>
                                {resetSuccessMessage || '이제 새 비밀번호로 로그인할 수 있습니다.'}
                            </p>
                            <button type="button" className={styles.loginButton} onClick={handleLoginOpen}>
                                로그인
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} message={errorMessage} />
        </div>
    );
}