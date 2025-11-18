'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // 이 페이지 전용 CSS
import ErrorModal from '../../find/component/ErrorModal'; // 공통 모달 임포트 경로 수정
import { findUserId } from '../../../store/api/userAuthApi';
import { FindIdRequest, FindIdResponse } from '../../../../types/auth';

export default function FindIdPage() {
    const router = useRouter();

    // 아이디 찾기 관련 상태
    const [findIdName, setFindIdName] = useState('');
    const [findIdEmail, setFindIdEmail] = useState('');
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

    // 아이디 찾기 API 호출
    const handleFindId = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data: FindIdResponse = await findUserId({
                name: findIdName,
                email: findIdEmail,
            });
            setFoundUsername(data.username);
            setFoundCreatedDate(data.createdDate);
            setFindIdStep(2); // 성공 화면으로 전환
        } catch (error: any) {
            console.error('아이디 찾기 요청 중 오류 발생:', error);
            openErrorModal(error.message || '아이디 찾기 중 오류가 발생했습니다.');
        }
    };

    const handleLoginRedirect = () => {
        router.push('/'); // 메인 페이지로 이동 또는 로그인 모달 열기
        //dispatch(openLoginModal());
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>아이디 찾기</h2>

                <div className={styles.tabContainer}> {/* 탭 내비게이션은 이메일 인증만 남김 */}
                    <button
                        type="button"
                        className={`${styles.tabButton} ${styles.activeTab}`}
                        disabled // 단일 탭이므로 비활성화
                    >
                        이메일 인증
                    </button>
                </div>

                {/* 아이디 찾기 내용 */}
                <div className={styles.tabContent}>
                    {findIdStep === 1 && (
                        <form onSubmit={handleFindId} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="findIdName">이름</label>
                                <input
                                    type="text"
                                    id="findIdName"
                                    className={styles.inputField}
                                    placeholder="이름을 입력해 주세요"
                                    value={findIdName}
                                    onChange={(e) => setFindIdName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="findIdEmail">이메일</label>
                                <input
                                    type="email"
                                    id="findIdEmail"
                                    className={styles.inputField}
                                    placeholder="이메일을 입력해 주세요"
                                    value={findIdEmail}
                                    onChange={(e) => setFindIdEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.confirmButton}>확인</button>
                        </form>
                    )}

                    {findIdStep === 2 && foundUsername && (
                        <div className={styles.resultContainer}>
                            <p className={styles.resultMessage}>고객님의 계정을 찾았습니다.</p>
                            <p className={styles.resultSubMessage}>아이디 확인 후 로그인해주세요.</p>
                            <div className={styles.foundIdInfo}>
                                <Image
                                    src="/images/ico_profile.svg" // 적절한 프로필 아이콘 경로로 변경
                                    alt="프로필 아이콘"
                                    width={24}
                                    height={24}
                                    className={styles.profileIcon}
                                />
                                <span className={styles.maskedId}>{showFullId ? foundUsername : foundUsername.replace(/(.{2}).+(.{3})/, '$1***$2')}</span>
                                <span className={styles.joinedDate}>가입일 {foundCreatedDate}</span>
                            </div>
                            <button type="button" className={styles.fullIdButton} onClick={() => setShowFullId(!showFullId)}>
                                {showFullId ? '아이디 숨기기' : '아이디 전체보기'}
                            </button>
                            <button type="button" className={styles.loginButton} onClick={handleLoginRedirect}>로그인</button>
                        </div>
                    )}
                </div>
            </div>
            <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} message={errorMessage} />
        </div>
    );
}
