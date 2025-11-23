"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store/slices/store';
import { selectIsLoggedIn, logout } from '../../store/slices/authSlice';
import styles from './page.module.css';
import Image from 'next/image'; // Image 컴포넌트 사용을 위해 import
import {
    UserResponseDTO,
    UserRequestDTO,
} from '@/types/authTypes';
import { getUserData, checkCurrentPassword as apiCheckCurrentPassword, updateUserProfile, checkExistence } from '../../store/api/userAuthApi';
import CircularProgress from '@mui/material/CircularProgress';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function ProfilePage() {
    const router = useRouter();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const dispatch = useAppDispatch(); // dispatch 훅 추가

    const [userData, setUserData] = useState<UserResponseDTO | null>(null);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
    const [nickname, setNickname] = useState<string>('');
    const [emailFront, setEmailFront] = useState<string>(''); // 이메일 앞 부분
    const [emailBack, setEmailBack] = useState<string>(''); // 이메일 뒷 부분 (도메인)
    const [isSocialUser, setIsSocialUser] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 이메일 중복/형식 에러 메시지 및 성공 메시지 상태 추가
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

    // 이메일 도메인 선택 박스 표시 여부 및 직접 입력 여부 상태 추가
    const [showEmailDomainSelect, setShowEmailDomainSelect] = useState(false); // 이메일 도메인 선택 박스 표시 여부
    const [isDirectInput, setIsDirectInput] = useState(false); // 이메일 도메인 직접 입력 여부
    const emailDropdownRef = useRef<HTMLDivElement | null>(null);

    // 비밀번호 가시성 상태 추가
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

    // 폼 제출 관련 에러 메시지 상태 추가
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
    const [currentPasswordMismatchError, setCurrentPasswordMismatchError] = useState<string | null>(null); // 현재 비밀번호 불일치 에러 메시지 추가
    const [generalUpdateError, setGeneralUpdateError] = useState<string | null>(null);

    const availableDomains = ['naver.com', 'gmail.com', 'hanmail.net', 'nate.com', 'hotmail.com', 'daum.net', 'outlook.com', 'kakao.com', '직접입력'];

    const [emailDirty, setEmailDirty] = useState(false);

    // 디바운스된 이메일 값
    const debouncedEmailFront = useDebounce(emailFront, 500); // 500ms debounce
    const debouncedEmailBack = useDebounce(emailBack, 500); // 500ms debounce
    const debouncedFullEmail = `${debouncedEmailFront}@${debouncedEmailBack}`;

    const fetchedOnce = useRef(false); // API 호출이 한 번 발생했는지 추적하는 useRef 추가

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

    useEffect(() => {
        // 로그인 상태이고, userData가 아직 로드되지 않았으며, 이전에 API 호출을 시도하지 않았을 경우에만 fetchData 호출
        if (isLoggedIn && !userData && !fetchedOnce.current) {
            const fetchUserData = async () => {
                setLoading(true); // 데이터 fetch 시작 시 로딩 상태 설정
                try {
                    fetchedOnce.current = true; // API 호출 시도 플래그 설정
                    const data: UserResponseDTO = await getUserData();
                    setUserData(data);
                    setNickname(data.nickname);
                    setIsSocialUser(data.social);
                    if (data.email) {
                        const [id, domain] = data.email.split('@');
                        setEmailFront(id);
                        setEmailBack(domain);
                        if (!availableDomains.includes(domain)) {
                            setIsDirectInput(true);
                        }
                        setEmailDirty(false);
                    } 
                } catch (err: any) {
                    setError(err.message);
                    console.error(`오류: ${err.message}`); // 개발자 도구에만 출력
                    if (
                        err.message.includes('리프레시 토큰이 만료되었거나 유효하지 않습니다.') ||
                        err.message.includes('토큰 재발급 후에도 인증되지 않았습니다.') ||
                        err.message.includes('액세스 토큰이 없습니다. 로그인해주세요.') ||
                        err.message.includes('액세스 토큰이 만료되었습니다. 다시 로그인해주세요.') ||
                        err.message.includes('탈퇴한 회원입니다. 자동으로 로그아웃 처리됩니다.')
                    ) {
                        alert('인증 정보가 유효하지 않거나, 삭제된 계정입니다. 다시 로그인해주세요.'); // 메시지 통합
                        dispatch(logout()); // Redux 상태에서 로그아웃 처리
                        localStorage.removeItem('accessToken'); // Access Token 제거 (안전성 강화)
                        router.push('/'); // 메인 페이지로 이동
                    } else {
                        // 기타 오류 처리 (예: 서버에서 보낸 다른 오류 메시지)
                        alert(`오류 발생: ${err.message}`);
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        } else if (userData) {
            setLoading(false); // 이미 데이터가 있으면 로딩 완료 처리
        } else if (!isLoggedIn && fetchedOnce.current) {
            setLoading(false);
        } else if (!isLoggedIn) {
            setLoading(false);
        }
    }, [isLoggedIn, router, userData, dispatch]); // dispatch를 의존성 배열에 추가

    const clearSuccessMessage = () => {
        if (generalUpdateError && generalUpdateError.includes('성공적으로')) {
            setGeneralUpdateError(null);
        }
    };

    // 현재 비밀번호 확인 함수
    const checkCurrentPassword = async (password: string): Promise<boolean> => {
        if (!password) {
            setCurrentPasswordMismatchError(null); // 비밀번호가 비어있으면 에러 메시지 초기화
            return false; // API 호출 없이 바로 false 반환
        }

        try {
            const isMatch: boolean = await apiCheckCurrentPassword(password);
            
            if (!isMatch) { // isMatch가 false인 경우 (비밀번호 불일치)
                setCurrentPasswordMismatchError('현재 비밀번호가 일치하지 않습니다.');
                return false;
            }
            // isMatch가 true인 경우 (비밀번호 일치), 오류 메시지 초기화
            setCurrentPasswordMismatchError(null);
            return true;
        } catch (error: any) {
            console.error('현재 비밀번호 확인 중 오류 발생:', error);
            setCurrentPasswordMismatchError(`오류 발생: ${error.message}`);
            return false;
        }
    };

    // 디바운스된 이메일 값이 변경될 때마다 중복 확인
    useEffect(() => {
        const normalizedEmail = `${debouncedEmailFront}@${debouncedEmailBack}`;

        if (!emailDirty) {
                setEmailError(null);
                setEmailSuccess(null);
            return;
        }

        if (
            !isSocialUser &&
            debouncedEmailFront &&
            debouncedEmailBack &&
            debouncedFullEmail !== '@'
        ) {
            handleEmailDuplicationCheck(debouncedFullEmail);
        } else {
            setEmailError(null);
            setEmailSuccess(null);
        }
    }, [debouncedFullEmail, userData, isSocialUser, debouncedEmailFront, debouncedEmailBack, emailDirty]);

    const handleEmailDomainChange = (domain: string) => {
        clearSuccessMessage();
        if (domain === '직접입력') {
            setEmailBack(''); // 직접입력 선택 시 도메인 값 초기화
            setIsDirectInput(true);
            setEmailDirty(false);
        } else {
            setEmailBack(domain);
            setIsDirectInput(false);
            setEmailDirty(Boolean(emailFront));
        }
        setShowEmailDomainSelect(false);
        setEmailError(null);
        setEmailSuccess(null);
        if (emailFront && domain !== '직접입력') {
            handleEmailDuplicationCheck(`${emailFront}@${domain}`);
        }
    };

    const handleEmailDuplicationCheck = async (email: string) => {
        // 클라이언트 측 이메일 형식 유효성 검사
        if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            setEmailSuccess(null);
            return false; // 형식 오류 시 유효하지 않음
        }

        // 이메일 변경이 없고 기존 이메일과 동일하면 중복 검사 건너뛰기
        if (userData && userData.email === email) {
            setEmailError(null);
            setEmailSuccess(null);
            return true;
        }

        try {
            const response = await checkExistence('email', email); // 중앙 API 함수 사용

            if (response.isExist) { // 이메일 중복 시
                setEmailError('이미 사용 중인 이메일입니다.');
                setEmailSuccess(null);
                return false; // 중복
            }

            setEmailError(null);
            setEmailSuccess('사용 가능한 이메일입니다.');
            return true; // 중복 아님
        } catch (error: any) {
            console.error('이메일 중복 검사 중 오류 발생:', error);
            setEmailError(`이메일 중복 검사 오류: ${error.message}`);
            setEmailSuccess(null);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // 모든 에러 상태 초기화
        setPasswordMismatchError(false);
        setCurrentPasswordError(null);
        setCurrentPasswordMismatchError(null); // 현재 비밀번호 불일치 에러 메시지 초기화
        setGeneralUpdateError(null);
        setEmailError(null); // 이메일 에러도 초기화
        setEmailSuccess(null); // 이메일 성공 메시지도 초기화

        if (!userData) {
            setGeneralUpdateError('사용자 정보를 불러오지 못했습니다.');
            return;
        }

        const updatedData: UserRequestDTO = {
            username: userData.username,
            nickname: nickname,
            email: userData.email, // 기존 이메일 값을 기본으로 포함
        };

        let isEmailChanged = false;
        const newFullEmail = `${emailFront}@${emailBack}`;

        if (userData.email !== newFullEmail) {
            isEmailChanged = true;
        }

        if (!isSocialUser) {
            // 자체 로그인 사용자만 비밀번호와 이메일 수정 가능
            if (newPassword) {
                if (newPassword !== newPasswordConfirm) {
                    setPasswordMismatchError(true);
                    alert('새 비밀번호를 확인해주세요!');
                    return;
                }
                // 현재 비밀번호 유효성 검사
                const isCurrentPasswordValid = await checkCurrentPassword(currentPassword);
                if (!isCurrentPasswordValid) {
                    return; // 비밀번호 불일치 시 제출 중단
                }
                updatedData.password = newPassword;
                updatedData.currentPassword = currentPassword; // 현재 비밀번호 추가
            }

            // 이메일이 변경된 경우에만 중복 확인 및 업데이트
            if (isEmailChanged) {
                const emailExists = await handleEmailDuplicationCheck(newFullEmail);
                if (!emailExists) { // 중복이거나 형식이 올바르지 않으면
                    return;
                }
                updatedData.email = newFullEmail; // 변경된 이메일로 업데이트
            }
        } else {
            // 소셜 로그인 사용자는 이메일 및 비밀번호 변경 불가
            if (isEmailChanged) {
                setGeneralUpdateError('소셜 로그인 사용자는 이메일을 변경할 수 없습니다.');
                return;
            }
            if (newPassword) { // 소셜 로그인 사용자가 비밀번호를 입력하려고 한 경우
                setGeneralUpdateError('소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.');
                return;
            }
        }

        try {
            const data = await updateUserProfile(updatedData);
            setGeneralUpdateError('회원 정보가 성공적으로 수정되었습니다.'); // 성공 메시지 표시
            setUserData(prevData => ({ ...prevData!, nickname: data.nickname || prevData!.nickname, email: data.email || prevData!.email }));
            setEmailDirty(false);
            setEmailSuccess('현재 이메일입니다.');
            // 비밀번호 변경 성공 시 비밀번호 필드 초기화 (보안상 좋음)
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirm('');
        } catch (err: any) {
            console.error('회원 정보 수정 중 오류 발생:', err);
            setGeneralUpdateError(`회원 정보 수정 중 오류 발생: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <CircularProgress size={32} />
                <span className={styles.loadingMessage}>회원 정보 불러오는 중…</span>
            </div>
        );
    }
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!userData) return <div className={styles.noData}>사용자 정보를 찾을 수 없습니다.</div>;

    return (
        <div className={styles.pageWrapper}> {/* 최상위 div에 pageWrapper 적용 */}
            <div className={styles.profileCard}> {/* 기존 container에 profileCard 적용 */}
                <div className={styles.headerSection}>
                    <h2 className={styles.pageTitle}>개인 정보 수정</h2>
                </div>
                <div className={styles.formSection}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username" className={styles.label}>아이디</label>
                            <div className={styles.inputFieldContainer}>
                                <input
                                    data-testid="input-box"
                                    id="username"
                                    name="username"
                                    type="text"
                                    readOnly
                                    className={styles.readOnlyInput}
                                    value={userData.username}
                                />
                            </div>
                        </div>

                        {!isSocialUser && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="currentPassword" className={styles.label}>현재 비밀번호</label>
                                    <div className={styles.inputFieldContainer}>
                                        <input
                                            data-testid="input-box"
                                            id="currentPassword"
                                            name="currentPassword"
                                            placeholder="현재 비밀번호를 입력해 주세요"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            autoComplete="off"
                                            className={`${styles.input} ${currentPasswordError || currentPasswordMismatchError ? styles.errorBorder : ''}`}
                                            value={currentPassword}
                                            onChange={(e) => {
                                                clearSuccessMessage();
                                                setCurrentPassword(e.target.value);
                                                setCurrentPasswordError(null); // 입력 시작 시 에러 메시지 초기화
                                                setCurrentPasswordMismatchError(null); // 입력 시작 시 불일치 에러 초기화
                                            }}
                                            onBlur={async () => {
                                                if (!isSocialUser && currentPassword) {
                                                    await checkCurrentPassword(currentPassword);
                                                } else if (!currentPassword) {
                                                    setCurrentPasswordMismatchError(null);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowCurrentPassword(prev => !prev)}
                                            aria-label={showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                        >
                                            <Image 
                                                src={showCurrentPassword ? '/images/open_eye.png' : '/images/closed_eye.png'}
                                                alt={showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                                width={20}
                                                height={20}
                                            />
                                        </button>
                                    </div>
                                    {currentPasswordMismatchError && <p className={styles.errorMessage}>{currentPasswordMismatchError}</p>}
                                    {currentPasswordError && <p className={styles.errorMessage}>{currentPasswordError}</p>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="newPassword" className={styles.label}>새 비밀번호</label>
                                    <div className={styles.inputFieldContainer}>
                                        <input
                                            data-testid="input-box"
                                            id="newPassword"
                                            name="newPassword"
                                            placeholder="새 비밀번호를 입력해 주세요"
                                            type={showNewPassword ? 'text' : 'password'}
                                            autoComplete="off"
                                            className={`${styles.inputField} ${passwordMismatchError ? styles.errorBorder : ''} ${newPassword ? styles.hasValue : ''}`}
                                            value={newPassword}
                                            onChange={(e) => {
                                                clearSuccessMessage();
                                                setNewPassword(e.target.value);
                                                if (newPasswordConfirm && e.target.value !== newPasswordConfirm) {
                                                    setPasswordMismatchError(true);
                                                } else {
                                                    setPasswordMismatchError(false);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowNewPassword(prev => !prev)}
                                            aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                        >
                                            <Image 
                                                src={showNewPassword ? '/images/open_eye.png' : '/images/closed_eye.png'}
                                                alt={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                                width={20}
                                                height={20}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="newPasswordConfirm" className={styles.label}>새 비밀번호 확인</label>
                                    <div className={styles.inputFieldContainer}>
                                        <input
                                            data-testid="input-box"
                                            id="newPasswordConfirm"
                                            name="newPasswordConfirm"
                                            placeholder="새 비밀번호를 다시 입력해 주세요"
                                            type={showNewPasswordConfirm ? 'text' : 'password'}
                                            autoComplete="off"
                                            className={`${styles.inputField} ${passwordMismatchError ? styles.errorBorder : ''} ${newPasswordConfirm ? styles.hasValue : ''}`}
                                            value={newPasswordConfirm}
                                            onChange={(e) => {
                                                clearSuccessMessage();
                                                setNewPasswordConfirm(e.target.value);
                                                if (newPassword && e.target.value !== newPassword) {
                                                    setPasswordMismatchError(true);
                                                } else {
                                                    setPasswordMismatchError(false);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowNewPasswordConfirm(prev => !prev)}
                                            aria-label={showNewPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                        >
                                            <Image 
                                                src={showNewPasswordConfirm ? '/images/open_eye.png' : '/images/closed_eye.png'}
                                                alt={showNewPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                                width={20}
                                                height={20}
                                            />
                                        </button>
                                    </div>
                                    {passwordMismatchError && <p className={styles.errorMessage}>새 비밀번호와 비밀번호 확인이 일치하지 않습니다.</p>}
                                </div>
                            </>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="nickname" className={styles.label}>닉네임</label>
                            <div className={styles.inputFieldContainer}>
                                <input
                                    data-testid="input-box"
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    className={styles.input}
                                    value={nickname}
                                    onChange={(e) => {
                                        clearSuccessMessage();
                                        setNickname(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        {!isSocialUser && (
                            <div className={styles.inputGroup}>
                                <label htmlFor="emailFront" className={styles.label}>이메일</label>
                                <div className={styles.boxEmail}>
                                    <div className={`${styles.boxInput} ${emailError ? styles.joinError : ''} ${emailFront ? styles.hasValue : ''}`}>
                                        <input
                                            type="text"
                                            id="emailFront"
                                            className={`${styles.inputInfo} ${styles.emailInput}`}
                                            placeholder="이메일 주소 입력"
                                            value={emailFront}
                                            onChange={(e) => {
                                                clearSuccessMessage();
                                                setEmailFront(e.target.value);
                                                setEmailDirty(true);
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className={styles.textAt}>@</div>
                                    <div
                                        ref={emailDropdownRef}
                                        className={`${styles.boxSelect} ${showEmailDomainSelect ? styles.on : ''}`}
                                    >
                                        {isDirectInput ? (
                                            <input
                                                type="text"
                                                id="emailDomainDirectInput"
                                                className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainInputField} ${emailBack ? styles.hasValue : ''}`}
                                                placeholder="직접 입력"
                                                value={emailBack}
                                                onChange={(e) => {
                                                    clearSuccessMessage();
                                                    setEmailBack(e.target.value);
                                                    setEmailDirty(true);
                                                }}
                                                onClick={(e) => e.stopPropagation()} // 입력 필드를 클릭했을 때 상위 이벤트 방지
                                                required={!emailError}
                                            />
                                        ) : (
                                            <div className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainDisplayField} ${emailBack ? styles.hasValue : ''}`}> {/* emailBack에 hasValue 추가 */}
                                                {emailBack || '선택해주세요.'}
                                            </div>
                                        )}
                                        <div className={styles.selectArrowContainer} onClick={() => setShowEmailDomainSelect(!showEmailDomainSelect)}> {/* 오직 이 div만 클릭해서 토글 */}
                                            <span className={styles.selectArrow}>{showEmailDomainSelect ? '▲' : '▼'}</span>
                                        </div>
                                        {showEmailDomainSelect && (
                                            <div className={styles.boxLayer}>
                                                <ul className={styles.listAdress}>
                                                    <li className={styles.listItem}>
                                                        <button type="button" className={styles.buttonMail} onClick={() => { handleEmailDomainChange('직접입력'); }}>직접입력</button>
                                                    </li>
                                                    {['naver.com', 'gmail.com', 'hanmail.net', 'nate.com', 'hotmail.com', 'daum.net', 'outlook.com', 'kakao.com'].map((domain) => (
                                                        <li className={styles.listItem} key={domain}>
                                                            <button type="button" className={styles.buttonMail} onClick={() => { handleEmailDomainChange(domain); }}>{domain}</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                                {!emailError && emailSuccess && <p className={styles.successMessage}>{emailSuccess}</p>}
                            </div>
                        )}

                        {generalUpdateError && (
                            <p className={`${styles.errorMessage} ${generalUpdateError.includes('성공적으로') ? styles.successMessage : ''}`}>{generalUpdateError}</p>
                        )}

                        <div className={styles.buttonGroup}>
                            <button type="submit" className={`${styles.bottomButton} ${styles.saveButton}`}>수정 내용 저장하기</button>

                        </div>
                        <hr className={styles.buttonSeparator} /> {/* 구분선 추가 */}
                        <div className={styles.buttonGroup}>
                            <button type="button" onClick={() => router.push('/mypage/profile/withdraw')} className={`${styles.bottomButton} ${styles.withdrawButton}`}>탈퇴하기</button>
                            
                        </div>
                        
                    </form>
                </div>
            </div>
        </div>
    );
}