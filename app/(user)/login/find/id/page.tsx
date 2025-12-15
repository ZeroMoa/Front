'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../store/slices/store';
import { openLoginModal } from '../../../store/slices/authSlice';
import styles from './page.module.css'; // 이 페이지 전용 CSS
import ErrorModal from '../../find/component/ErrorModal'; // 공통 모달 임포트 경로 수정
import { findUserId } from '../../../store/api/userAuthApi';
import { FindIdResponse } from '../../../../../types/authTypes';

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

const getRawErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
            return (error as { message?: string }).message as string;
        }
        if ('message' in error) {
            return String((error as { message?: unknown }).message);
        }
    }
    return '';
};

const getFindIdFriendlyError = (error: unknown): string => {
    const rawMessage = getRawErrorMessage(error);
    if (!rawMessage) {
        return '아이디 찾기 중 오류가 발생했습니다.';
    }
    if (rawMessage.includes('Failed to fetch')) {
        return '서버와 연결이 끊어졌습니다.';
    }
    if (/올바른 형식의 이메일 주소|Email\.|Email\b|\bemail\b|이메일/i.test(rawMessage)) {
        return '잘못된 이메일 형식입니다.';
    }
    if (rawMessage.includes('인증 자격')) {
        return '이메일 주소를 잘못 입력하셨습니다.';
    }
    return rawMessage || '아이디 찾기 중 오류가 발생했습니다.';
};

export default function FindIdPage() {
    const dispatch = useAppDispatch();

    // 아이디 찾기 관련 상태
    const [findIdName, setFindIdName] = useState('');
    const [findIdEmailFront, setFindIdEmailFront] = useState('');
    const [findIdEmailBack, setFindIdEmailBack] = useState('');
    const [showEmailDomainSelect, setShowEmailDomainSelect] = useState(false);
    const [isEmailDirectInput, setIsEmailDirectInput] = useState(false);
    const emailDropdownRef = useRef<HTMLDivElement | null>(null);
    const [foundUsername, setFoundUsername] = useState<string | null>(null); // 찾은 아이디
    const [foundCreatedDate, setFoundCreatedDate] = useState<string | null>(null); // 가입 날짜
    const [showFullId, setShowFullId] = useState(false); // 아이디 전체보기 상태
    const [findIdStep, setFindIdStep] = useState(1); // 1: 입력 폼, 2: 결과 화면

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

    // 아이디 찾기 API 호출
    const handleFindId = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedFront = findIdEmailFront.trim();
        const trimmedBack = findIdEmailBack.trim();
        if (!trimmedFront || !trimmedBack) {
            openErrorModal('이메일을 완전하게 입력해 주세요.');
            return;
        }

        try {
            const data: FindIdResponse = await findUserId({
                name: findIdName,
                email: `${trimmedFront}@${trimmedBack}`,
            });
            setFoundUsername(data.username);
            setFoundCreatedDate(data.createdDate);
            setFindIdStep(2); // 성공 화면으로 전환
        } catch (error: any) {
            openErrorModal(getFindIdFriendlyError(error));
        }
    };

    const handleLoginRedirect = () => {
        dispatch(openLoginModal());
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>아이디 찾기</h2>
                <div className={styles.sectionDivider} aria-hidden="true" />

                <div className={styles.tabContent}>
                    {findIdStep === 1 && (
                        <form
                            onSubmit={handleFindId}
                            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <div className={styles.inputGroup}>
                                <label htmlFor="findIdEmail">이메일</label>
                                <div className={styles.boxEmail}>
                                    <div className={`${styles.boxInput} ${findIdEmailFront ? styles.hasValue : ''}`}>
                                <input
                                            type="text"
                                    id="findIdEmail"
                                            className={`${styles.inputInfo} ${styles.emailInput}`}
                                            placeholder="이메일 앞자리 입력"
                                            value={findIdEmailFront}
                                            onChange={(e) => setFindIdEmailFront(e.target.value.replace(/\s+/g, ''))}
                                    required
                                />
                            </div>
                                    <div className={styles.textAt}>@</div>
                                    <div ref={emailDropdownRef} className={styles.boxSelect}>
                                        {isEmailDirectInput ? (
                                            <input
                                                type="text"
                                                className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainInputField} ${
                                                    findIdEmailBack ? styles.hasValue : ''
                                                }`}
                                                placeholder="직접 입력"
                                                value={findIdEmailBack}
                                                onChange={(e) => setFindIdEmailBack(e.target.value.replace(/\s+/g, ''))}
                                                onClick={(e) => e.stopPropagation()}
                                                required
                                            />
                                        ) : (
                                            <div
                                                className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainDisplayField} ${
                                                    findIdEmailBack ? styles.hasValue : ''
                                                }`}
                                            >
                                                {findIdEmailBack || '선택해주세요.'}
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
                                                            setFindIdEmailBack('');
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
                                                                setFindIdEmailBack(domain);
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
                            <button type="submit" className={styles.confirmButton}>
                                확인
                            </button>
                        </form>
                    )}

                    {findIdStep === 2 && foundUsername && (
                        <div className={styles.resultContainer}>
                            <p className={styles.resultMessage}>고객님의 계정을 찾았습니다.</p>
                            <p className={styles.resultSubMessage}>아이디 확인 후 로그인해주세요.</p>
                            <div className={styles.foundIdInfo}>
                                <span className={styles.maskedId}>{showFullId ? foundUsername : foundUsername.replace(/(.{2}).+(.{3})/, '$1***$2')}</span>
                                <span className={styles.joinedDate}>가입일 {foundCreatedDate}</span>
                            </div>
                            
                            <button type="button" className={styles.loginButton} onClick={handleLoginRedirect}>로그인</button>
                        </div>
                    )}
                </div>
            </div>
            <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} message={errorMessage} />
        </div>
    );
}
