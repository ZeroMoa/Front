'use client'

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../app/store/store';
import { openLoginModal } from '../../../app/store/authSlice';
import styles from './page.module.css';

export default function JoinPage() {
    const [step, setStep] = useState(1); // 1: 회원가입 양식, 2: 완료 화면
    const [username, setUsername] = useState(''); // 아이디
    const [email, setEmail] = useState(''); // 이메일
    const [nickname, setNickname] = useState(''); // 닉네임 (선택 사항)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false); // 비밀번호 불일치 에러 상태
    const [usernameError, setUsernameError] = useState<string | null>(null); // 아이디 중복 에러 메시지
    const [emailError, setEmailError] = useState<string | null>(null); // 이메일 중복/형식 에러 메시지
    const [nicknameError, setNicknameError] = useState<string | null>(null); // 닉네임 유효성 에러 메시지 (현재는 사용하지 않음)
    const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null); // 아이디 사용 가능 메시지
    const [emailSuccess, setEmailSuccess] = useState<string | null>(null); // 이메일 사용 가능 메시지
    const [emailFront, setEmailFront] = useState(''); // 이메일 앞 부분
    const [emailBack, setEmailBack] = useState(''); // 이메일 뒷 부분 (도메인)
    const [showEmailDomainSelect, setShowEmailDomainSelect] = useState(false); // 이메일 도메인 선택 박스 표시 여부
    const [isDirectInput, setIsDirectInput] = useState(false); // 이메일 도메인 직접 입력 여부

    const router = useRouter();
    const dispatch = useAppDispatch();

    // 아이디 및 이메일 중복 확인 API 호출 함수
    const checkExistence = useCallback(async (field: 'username' | 'email', value: string) => {
        if (!value) {
            if (field === 'username') { setUsernameError(null); setUsernameSuccess(null); }
            if (field === 'email') { setEmailError(null); setEmailSuccess(null); }
            return;
        }

        // 이메일 형식 유효성 검사 (클라이언트 측)
        if (field === 'email' && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            setEmailSuccess(null);
            return;
        }

        try {
            const apiPath = field === 'username' ? '/user/exist' : '/user/exist-email'; // API 엔드포인트 분리
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${apiPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [field]: value }),
            });

            // 이메일 전용: 409 Conflict 응답 처리 (이미 존재하는 경우)
            if (field === 'email' && response.status === 409) {
                setEmailError('이미 사용 중인 이메일입니다.');
                setEmailSuccess(null);
                return; // 409 응답 처리 후 추가 진행 중단
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '서버 오류 발생' })); // JSON 파싱 실패 대비
                if (field === 'username') { setUsernameError(errorData.message || '아이디 확인 중 오류 발생'); setUsernameSuccess(null); }
                if (field === 'email') { setEmailError(errorData.message || '이메일 확인 중 오류 발생'); setEmailSuccess(null); }
                return;
            }

            // 200 OK 응답 처리 (isExist 값에 따라 성공/실패 메시지 설정)
            const isExist = await response.json();

            if (field === 'username') {
                if (isExist) { // true 반환: 이미 사용 중
                    setUsernameError('이미 사용 중인 아이디입니다.');
                    setUsernameSuccess(null);
                } else { // false 반환: 사용 가능
                    setUsernameError(null);
                    setUsernameSuccess('사용 가능한 아이디입니다.');
                }
            } else if (field === 'email') {
                // /user/exist-email은 200 OK 시 isExist가 항상 false (409에서 true 처리됨)
                setEmailError(null);
                setEmailSuccess('사용 가능한 이메일입니다.');
            }
        } catch (error) {
            console.error('중복 확인 중 오류 발생:', error);
            if (field === 'username') { setUsernameError('중복 확인 중 오류가 발생했습니다.'); setUsernameSuccess(null); }
            if (field === 'email') { setEmailError('중복 확인 중 오류가 발생했습니다.'); setEmailSuccess(null); }
        }
    }, []);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setPasswordMismatchError(true);
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        setPasswordMismatchError(false);

        // 필수 필드 유효성 검사
        if (!username || !emailFront || !emailBack || !password || !confirmPassword) {
            alert('모든 필수 필드를 올바르게 입력해주세요.');
            return;
        }

        // 아이디 및 이메일 중복/형식 에러가 있는 경우 진행 불가
        if (usernameError || emailError) {
            alert('아이디 또는 이메일 중복/형식 확인이 필요합니다.');
            return;
        }

        // 마지막으로, 현재 입력된 값으로 한 번 더 중복 확인을 트리거
        // 이는 사용자가 필드에 입력 후 '다음' 버튼을 바로 누르는 경우를 대비
        // (onBlur가 발생하지 않은 경우) - 선택 사항인 닉네임은 제외
        if (!usernameError && !usernameSuccess) checkExistence('username', username); // 아직 확인 안 되었거나 에러 없으면 확인
        if (!emailError && !emailSuccess) checkExistence('email', `${emailFront}@${emailBack}`); // 아직 확인 안 되었거나 에러 없으면 확인

        // 비동기 중복 확인이 완료될 시간을 확보하고 다시 검사
        // 실제 프로덕션에서는 API 응답을 기다린 후 다음 단계를 진행하는 방식이 더 견고합니다.
        setTimeout(() => {
            if (usernameError || emailError || !usernameSuccess || !emailSuccess) { // 에러가 있거나 성공 메시지가 없으면
                alert('아이디 또는 이메일 중복/형식 확인이 필요합니다.');
                return;
            }
            console.log('회원가입 정보:', { username, email: `${emailFront}@${emailBack}`, nickname, password });
            setStep(2);
        }, 100); // 짧은 지연 시간

    };

    const handlePrev = () => {
        setStep(1);
    };

    const handleLoginClick = () => {
        dispatch(openLoginModal());
        router.push('/');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (confirmPassword && e.target.value !== confirmPassword) {
            setPasswordMismatchError(true);
        } else {
            setPasswordMismatchError(false);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (password && e.target.value !== password) {
            setPasswordMismatchError(true);
        } else {
            setPasswordMismatchError(false);
        }
    };

    return (
        <div className={styles.container}>
            {step === 1 && (
                <div className={styles.card}>
                    <div className={styles.requiredInfo}>은 필수입력사항 입니다.</div>
                    <h2 className={styles.title}>회원가입</h2>
                    <p className={styles.subtitle}>아이디, 이메일, 비밀번호는 필수 입력 사항입니다.</p>

                    <form onSubmit={handleNext} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">아이디<span className={styles.requiredField}>*</span></label>
                            <div className={styles.inputFieldContainer}>
                                <input 
                                    type="text" 
                                    id="username" 
                                    className={`${styles.inputField} ${username ? styles.hasValue : ''}`}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => checkExistence('username', username)}
                                    required
                                />
                            </div>
                            {usernameError && <p className={styles.errorMessage}>{usernameError}</p>}
                            {!usernameError && usernameSuccess && <p className={styles.successMessage}>{usernameSuccess}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="emailFront">이메일<span className={styles.requiredField}>*</span></label>
                            <div className={styles.boxEmail}>
                                <div className={`${styles.boxInput} ${emailError ? styles.joinError : ''} ${emailFront ? styles.hasValue : ''}`}>
                                    <input
                                        type="text"
                                        id="emailFront"
                                        className={`${styles.inputInfo} ${styles.emailInput}`}
                                        placeholder="이메일 주소 입력"
                                        value={emailFront}
                                        onChange={(e) => setEmailFront(e.target.value)}
                                        onBlur={() => checkExistence('email', `${emailFront}@${emailBack}`)}
                                        required
                                    />
                                    {emailFront && <button type="button" className={styles.btnDel} onClick={() => setEmailFront('')}><span className={styles.icoIDel}></span></button>}
                                </div>
                                <div className={styles.textAt}>@</div>
                                <div
                                    className={`${styles.boxSelect} ${showEmailDomainSelect ? styles.on : ''}`}
                                >
                                    {isDirectInput ? (
                                        <input
                                            type="text"
                                            id="emailDomainDirectInput"
                                            className={`${styles.inputInfo} ${styles.emailInput} ${styles.domainInputField} ${emailBack ? styles.hasValue : ''}`}
                                            placeholder="직접 입력"
                                            value={emailBack}
                                            onChange={(e) => setEmailBack(e.target.value)}
                                            onBlur={() => checkExistence('email', `${emailFront}@${emailBack}`)}
                                            onClick={(e) => e.stopPropagation()} // 입력 필드를 클릭했을 때 상위 이벤트 방지
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
                                                {['naver.com', 'gmail.com', 'hanmail.net', 'nate.com', 'hotmail.com', 'daum.net', 'outlook.com', 'kakao.com'].map((domain) => (
                                                    <li className={styles.listItem} key={domain}>
                                                        <button type="button" className={styles.buttonMail} onClick={() => { setEmailBack(domain); setIsDirectInput(false); setShowEmailDomainSelect(false); checkExistence('email', `${emailFront}@${domain}`); }}>{domain}</button>
                                                    </li>
                                                ))}
                                                <li className={styles.listItem}>
                                                    <button type="button" className={styles.buttonMail} onClick={() => { setEmailBack(''); setIsDirectInput(true); setShowEmailDomainSelect(false); }}>직접입력</button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {emailError && <p className={styles.errorMessage}>{emailError}</p>}
                            {!emailError && emailSuccess && <p className={styles.successMessage}>{emailSuccess}</p>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="nickname">닉네임</label>
                            <div className={styles.inputFieldContainer}>
                                <input 
                                    type="text" 
                                    id="nickname" 
                                    className={`${styles.inputField} ${nickname ? styles.hasValue : ''}`}
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">비밀번호<span className={styles.requiredField}>*</span></label>
                            <input 
                                type="password" 
                                id="password" 
                                className={`${styles.inputField} ${password ? styles.hasValue : ''}`}
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">비밀번호 확인<span className={styles.requiredField}>*</span></label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                className={`${styles.inputField} ${passwordMismatchError ? styles.errorBorder : ''} ${confirmPassword ? styles.hasValue : ''}`}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                            />
                            {passwordMismatchError && (
                                <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
                            )}
                        </div>

                        <div className={styles.buttonGroup}>
                            <button type="button" className={`${styles.button} ${styles.prevButton}`} onClick={handlePrev} disabled>이전</button>
                            <button type="submit" className={`${styles.button} ${styles.nextButton}`}>다음</button>
                        </div>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className={styles.completionCard}>
                    <Image 
                        src="/images/check.png" 
                        alt="회원가입 완료" 
                        width={80} 
                        height={80} 
                        className={styles.checkIcon}
                    />
                    <h2 className={styles.completionMessage}>회원가입이 완료되었습니다.</h2>
                    <p className={styles.completionSubtitle}>로그인하시면 더욱 다양한 서비스와 혜택을 받으실 수 있습니다.</p>
                    <button type="button" className={styles.loginButton} onClick={handleLoginClick}>
                        로그인
                    </button>
                </div>
            )}
        </div>
    );
}
