'use client'

import React, { useState } from 'react';
import Image from 'next/image'; // 이미지가 필요하다면
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // 이 페이지 전용 CSS
import ErrorModal from '../../find/component/ErrorModal'; // 공통 모달 임포트 경로 수정

export default function FindPasswordPage() {
    const router = useRouter();

    // 비밀번호 찾기 (초기화 시작) 관련 상태
    const [findPwUsername, setFindPwUsername] = useState('');
    const [findPwEmail, setFindPwEmail] = useState('');
    const [resetToken, setResetToken] = useState<string | null>(null); // 비밀번호 재설정 토큰
    const [findPwStep, setFindPwStep] = useState(1); // 1: 입력 폼, 2: 비밀번호 재설정 폼

    // 비밀번호 재설정 관련 상태
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false); // 비밀번호 불일치 에러 상태

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

    // 비밀번호 초기화 시작 API 호출
    const handleInitiatePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/initiate-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: findPwUsername,
                    email: findPwEmail,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResetToken(data.resetToken); // 토큰 저장
                setFindPwStep(2); // 비밀번호 재설정 폼으로 전환
            } else if (response.status === 404) {
                openErrorModal('가입 시 입력하신 회원 정보가 맞는지 다시 한번 확인해 주세요.');
            } else {
                let errorData = { message: response.statusText || '비밀번호 찾기 실패: 알 수 없는 오류' };
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (jsonError) {
                        console.error('응답 JSON 파싱 실패:', jsonError);
                    }
                }
                openErrorModal(errorData.message || '비밀번호 찾기 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 찾기 요청 중 오류 발생:', error);
            openErrorModal('네트워크 오류 또는 서버 응답 없음.');
        }
    };

    // 비밀번호 재설정 완료 API 호출
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setPasswordMismatchError(true);
            openErrorModal('비밀번호가 일치하지 않습니다.');
            return;
        }
        setPasswordMismatchError(false);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resetToken: resetToken,
                    password: newPassword,
                }),
            });

            if (response.ok) {
                alert('비밀번호가 성공적으로 재설정되었습니다. 다시 로그인해주세요.');
                router.push('/'); // 로그인 페이지로 리다이렉트 (메인 페이지로 가정)
            } else if (response.status === 400) {
                openErrorModal('유효하지 않거나 만료된 토큰이거나, 비밀번호 정책에 맞지 않습니다.');
            } else {
                let errorData = { message: response.statusText || '비밀번호 재설정 실패: 알 수 없는 오류' };
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (jsonError) {
                        console.error('응답 JSON 파싱 실패:', jsonError);
                    }
                }
                openErrorModal(errorData.message || '비밀번호 재설정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 재설정 요청 중 오류 발생:', error);
            openErrorModal('네트워크 오류 또는 서버 응답 없음.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>비밀번호 찾기</h2>

                <div className={styles.tabContainer}> {/* 탭 내비게이션은 이메일 인증만 남김 */}
                    <button
                        type="button"
                        className={`${styles.tabButton} ${styles.activeTab}`}
                        disabled // 단일 탭이므로 비활성화
                    >
                        이메일 인증
                    </button>
                </div>

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
                                <input
                                    type="email"
                                    id="findPwEmail"
                                    className={styles.inputField}
                                    placeholder="이메일을 입력해 주세요"
                                    value={findPwEmail}
                                    onChange={(e) => setFindPwEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.confirmButton}>확인</button>
                        </form>
                    )}

                    {findPwStep === 2 && resetToken && (
                        <form onSubmit={handleResetPassword} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="newPassword">새 비밀번호 등록</label>
                                <input
                                    type="password"
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
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
                                <input
                                    type="password"
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
                                {passwordMismatchError && (
                                    <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
                                )}
                            </div>
                            <button type="submit" className={styles.confirmButton}>확인</button>
                        </form>
                    )}
                </div>
            </div>
            <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} message={errorMessage} />
        </div>
    );
}