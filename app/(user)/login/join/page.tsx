'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../store/slices/store';
import { openLoginModal } from '../../store/slices/authSlice';
import styles from './page.module.css';
import { checkExistence, joinUser } from '../../store/api/userAuthApi';
import { getCdnUrl } from '../../../../lib/cdn';

const PASSWORD_RULES = [
    {
        id: 'length',
        label: '8자 이상',
        validate: (value: string) => value.length >= 8,
    },
    {
        id: 'letter',
        label: '영문 대/소문자 포함',
        validate: (value: string) => /(?=.*[a-z])(?=.*[A-Z])/.test(value),
    },
    {
        id: 'number',
        label: '숫자 포함',
        validate: (value: string) => /\d/.test(value),
    },
    {
        id: 'special',
        label: '특수문자 포함 (!@#$%^&*)',
        validate: (value: string) => /[!@#$%^&*]/.test(value),
    },
];

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

export default function JoinPage() {
    const [step, setStep] = useState(1); // 1: 회원가입 양식, 2: 완료 화면
    const [username, setUsername] = useState(''); // 아이디
    const [email, setEmail] = useState(''); // 이메일
    const [nickname, setNickname] = useState(''); // 닉네임 (선택 사항)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);
    const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
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
    const [isUsernameValidState, setIsUsernameValidState] = useState<boolean | null>(null); // 아이디 최종 유효성 상태: null(검사중), true(유효), false(유효하지 않음)
    const [isEmailValidState, setIsEmailValidState] = useState<boolean | null>(null); // 이메일 최종 유효성 상태: null(검사중), true(유효), false(유효하지 않음)
    const emailDropdownRef = useRef<HTMLDivElement | null>(null);
    const [emailDirty, setEmailDirty] = useState(false);

    // 비밀번호 가시성 상태 추가
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const dispatch = useAppDispatch();

    // 아이디 및 이메일 중복 확인 API 호출 함수
    const checkExistenceCallback = useCallback(async (field: 'username' | 'email', value: string): Promise<boolean> => {
        if (field === 'username') setIsUsernameValidState(null); // 검사 시작 시 상태 초기화
        if (field === 'email') setIsEmailValidState(null); // 검사 시작 시 상태 초기화

        if (!value) {
            if (field === 'username') { setUsernameError(null); setUsernameSuccess(null); setIsUsernameValidState(false); }
            if (field === 'email') { setEmailError(null); setEmailSuccess(null); setIsEmailValidState(false); }
            return false; // 빈 값은 유효하지 않음
        }

        // 이메일 형식 유효성 검사 (클라이언트 측)
        if (field === 'email' && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            setEmailSuccess(null);
            setIsEmailValidState(false);
            return false; // 형식 오류 시 유효하지 않음
        }

        try {
            const response = await checkExistence(field, value); // 중앙 API 함수 사용

            if (field === 'username') {
                if (response.isExist) { // true 반환: 이미 사용 중
                    setUsernameError('이미 사용 중인 아이디입니다.');
                    setUsernameSuccess(null);
                    setIsUsernameValidState(false); // 이미 사용 중이면 유효하지 않음
                    return false;
                } else { // false 반환: 사용 가능
                    setUsernameError(null);
                    setUsernameSuccess('사용 가능한 아이디입니다.');
                    setIsUsernameValidState(true); // 사용 가능하면 유효
                    return true;
                }
            } else if (field === 'email') {
                if (response.isExist) { // 이메일 중복 시
                    setEmailError('이미 사용 중인 이메일입니다.');
                    setEmailSuccess(null);
                    setIsEmailValidState(false);
                    return false; // 중복
                } else {
                    setEmailError(null);
                    setEmailSuccess('사용 가능한 이메일입니다.');
                    setIsEmailValidState(true); // 사용 가능하면 유효
                    return true;
                }
            }
            return false; // 예상치 못한 경우
        } catch (error: any) {
            console.error('중복 확인 중 오류 발생:', error);
            const fallback = field === 'username' ? '사용중인 아이디입니다.' : '사용중인 이메일입니다.';
            const networkMessage = '네트워크 오류 또는 서버와 통신하지 못했습니다.';
            const message =
                typeof error?.message === 'string' &&
                error.message.toLowerCase().includes('failed to fetch')
                    ? networkMessage
                    : error?.message || fallback;

            if (field === 'username') {
                setUsernameError(message);
                setUsernameSuccess(null);
                setIsUsernameValidState(false);
            }
            if (field === 'email') {
                setEmailError(message);
                setEmailSuccess(null);
                setIsEmailValidState(false);
            }
            return false; // 네트워크 또는 기타 오류 시 유효하지 않음
        }
    }, []);

    // Debounced values
    const debouncedUsername = useDebounce(username, 500); // 500ms debounce
    const debouncedEmailFront = useDebounce(emailFront, 500); // 500ms debounce
    const debouncedEmailBack = useDebounce(emailBack, 500); // 500ms debounce
    const debouncedEmail = `${debouncedEmailFront}@${debouncedEmailBack}`;

    // Use useEffect to trigger checkExistence when debounced values change
    useEffect(() => {
        if (debouncedUsername) {
            checkExistenceCallback('username', debouncedUsername);
        } else {
            setUsernameError(null);
            setUsernameSuccess(null);
            setIsUsernameValidState(null);
        }
    }, [debouncedUsername, checkExistenceCallback]);

    useEffect(() => {
        if (
            emailDirty &&
            debouncedEmailFront &&
            debouncedEmailBack &&
            debouncedEmail !== '@'
        ) {
            checkExistenceCallback('email', debouncedEmail);
        }
    }, [debouncedEmail, checkExistenceCallback, debouncedEmailFront, debouncedEmailBack, emailDirty]);

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

    const handleNext = async (e: React.FormEvent) => { // async로 변경
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setPasswordMismatchError(true);
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        setPasswordMismatchError(false);

        const isPasswordValid = PASSWORD_RULES.every((rule) => rule.validate(password));
        if (!isPasswordValid) {
            alert('비밀번호가 규칙을 모두 충족해야 합니다.');
            return;
        }

        if (!isTermsAgreed || !isPrivacyAgreed) {
            alert('필수 약관에 모두 동의해주세요.');
            return;
        }

        // 1. 기본 필수 필드 유효성 검사
        const isEmailComplete = emailFront && emailBack && emailFront.trim() !== '' && emailBack.trim() !== '';
        if (!username || !isEmailComplete || !password || !confirmPassword) {
            alert('아이디, 이메일 주소, 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 2. 최종 제출 시점에 중복 확인 강제 트리거 및 결과 대기
        const usernameResponse = await checkExistence('username', username).catch(() => ({ isExist: true }));
        const emailResponse = await checkExistence('email', `${emailFront}@${emailBack}`).catch(() => ({ isExist: true }));

        // `checkExistence` 호출 후 상태 업데이트를 기다립니다.
        // 이 부분이 중요합니다. `checkExistence`는 상태를 비동기적으로 업데이트하므로,
        // `handleNext`에서는 그 상태가 최종적으로 반영되었는지 확인해야 합니다.
        // 실제 상황에서는 `checkExistence` 내부에서 `setIsUsernameValidState`와 `setIsEmailValidState`가
        // 호출되고, 이 상태가 업데이트되는 것을 기다려야 합니다.
        // 여기서는 `checkExistence`의 반환값을 직접 사용하여 `isUsernameValidState`와 `isEmailValidState`를 업데이트합니다.
        setIsUsernameValidState(!usernameResponse.isExist);
        setIsEmailValidState(!emailResponse.isExist); // 이메일은 isExist가 false여야 유효 (409에서 true 처리)

        // 3. 최종 유효성 상태 확인
        // 디바운스된 상태가 아닌, 제출 시점에 직접 검사한 결과를 사용합니다.
        if (usernameResponse.isExist) {
            alert("이미 사용중인 아이디입니다.");
            return;
        }
        if (emailResponse.isExist) {
            alert("이미 사용중인 이메일입니다.");
            return;
        }

        // 모든 검사 통과 후 다음 단계로 이동
        console.log('회원가입 정보:', { username, email: `${emailFront}@${emailBack}`, nickname, password });

        try {
            const successData = await joinUser({
                username,
                email: `${emailFront}@${emailBack}`,
                nickname,
                password,
            });
            console.log('회원가입 성공:', successData);
            setStep(2); // 회원가입 성공 시 완료 화면으로 이동

        } catch (error: any) {
            console.error('회원가입 요청 중 오류 발생:', error);
            alert(`회원가입 실패: ${error.message}`);
        }
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

    const availableDomains = ['naver.com', 'gmail.com', 'hanmail.net', 'nate.com', 'hotmail.com', 'daum.net', 'outlook.com', 'kakao.com', '직접입력'];

    const handleEmailDomainChange = (domain: string) => {
        if (domain === '직접입력') {
            setEmailBack('');
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
            checkExistenceCallback('email', `${emailFront}@${domain}`);
        }
    };

    return (
        <div className={styles.container}>
            {step === 1 && (
                <div className={styles.card}>
                    <div className={styles.requiredInfo}>은 필수입력사항 입니다.</div>
                    <h2 className={styles.title}>회원가입</h2>
                    <p className={styles.subtitle}> </p>

                    <form onSubmit={handleNext} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">아이디<span className={styles.requiredField}>*</span></label>
                            <div className={styles.inputFieldContainer}>
                                <input 
                                    type="text" 
                                    id="username" 
                                    className={`${styles.inputField} ${username ? styles.hasValue : ''}`}
                                    value={username}
                                    onChange={(e) => {
                                        const normalized = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                        setUsername(normalized);
                                    }}
                                    inputMode="text"
                                    pattern="[A-Za-z0-9]*"
                                    autoComplete="username"
                                    required /* onBlur 제거 */
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
                                        onChange={(e) => {
                                            setEmailFront(e.target.value);
                                            setEmailDirty(true);
                                        }}
                                        required /* onBlur 제거 */
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
                                                setEmailBack(e.target.value);
                                                setEmailDirty(true);
                                            }}
                                            onClick={(e) => e.stopPropagation()} // 입력 필드를 클릭했을 때 상위 이벤트 방지
                                            required={!emailError} /* 이메일 오류가 없을 때만 required */
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
                                                    <button type="button" className={styles.buttonMail} onClick={() => { setEmailBack(''); setIsDirectInput(true); setShowEmailDomainSelect(false); }}>직접입력</button>
                                                </li>
                                                {['naver.com', 'gmail.com', 'hanmail.net', 'nate.com', 'hotmail.com', 'daum.net', 'outlook.com', 'kakao.com'].map((domain) => (
                                                    <li className={styles.listItem} key={domain}>
                                                        <button type="button" className={styles.buttonMail} onClick={() => { setEmailBack(domain); setIsDirectInput(false); setShowEmailDomainSelect(false); checkExistenceCallback('email', `${emailFront}@${domain}`); }}>{domain}</button>
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
                            <div className={styles.inputFieldContainer}>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    id="password" 
                                    className={`${styles.inputField} ${password ? styles.hasValue : ''}`}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(prev => !prev)}
                                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                >
                                    <Image 
                                        src={getCdnUrl(showPassword ? '/images/open_eye.png' : '/images/closed_eye.png')}
                                        alt={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                                        width={20}
                                        height={20}
                                    />
                                </button>
                            </div>
                            <div className={styles.passwordRules}>
                                {PASSWORD_RULES.map((rule) => {
                                    const isValid = rule.validate(password);
                                    return (
                                        <div
                                            key={rule.id}
                                            className={`${styles.passwordRule} ${isValid ? styles.passwordRuleValid : ''}`}
                                        >
                                            <span className={styles.passwordRuleIcon} aria-hidden="true">
                                                {isValid ? '✔' : '✕'}
                                            </span>
                                            <span>{rule.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">비밀번호 확인<span className={styles.requiredField}>*</span></label>
                            <div className={styles.inputFieldContainer}>
                                <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    id="confirmPassword" 
                                    className={`${styles.inputField} ${passwordMismatchError ? styles.errorBorder : ''} ${confirmPassword ? styles.hasValue : ''}`}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
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

                        <div className={styles.agreementSection}>
                            <div className={styles.agreementGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input 
                                        type="checkbox" 
                                        checked={isTermsAgreed} 
                                        onChange={(e) => setIsTermsAgreed(e.target.checked)} 
                                    />
                                    <span className={styles.checkboxText}>[필수] 서비스 이용약관 동의</span>
                                </label>
                                <div className={styles.termsScrollBox}>
                                    제1조(목적) 이 약관은 제로모아(이하 &quot;회사&quot;라 합니다)가 운영하는 웹사이트에서 제공하는 인터넷 관련 서비스(이하 &quot;서비스&quot;라 합니다)를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                                    <br /><br />
                                    제2조(정의)
                                    ① &quot;이용자&quot;란 웹사이트에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
                                    ② &quot;회원&quot;이라 함은 웹사이트에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
                                    <br /><br />
                                    제3조(약관의 명시와 개정)
                                    ① 회사는 이 약관의 내용과 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호, 연락처 등을 이용자가 알 수 있도록 서비스 초기 화면에 게시합니다.
                                    ② 회사는 약관의 규제에 관한 법률, 전자거래기본법, 전자서명법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
                                </div>
                            </div>

                            <div className={styles.agreementGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input 
                                        type="checkbox" 
                                        checked={isPrivacyAgreed} 
                                        onChange={(e) => setIsPrivacyAgreed(e.target.checked)} 
                                    />
                                    <span className={styles.checkboxText}>[필수] 개인정보 수집 및 이용 동의</span>
                                </label>
                                <div className={styles.privacySummaryBox}>
                                    <table className={styles.privacyTable}>
                                        <thead>
                                            <tr>
                                                <th>항목</th>
                                                <th>목적</th>
                                                <th>보유 기간</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>아이디, 비밀번호, 닉네임, 이메일</td>
                                                <td>회원 가입 및 식별, 부정 이용 방지</td>
                                                <td>회원 탈퇴 시 즉시 파기</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p className={styles.agreementNotice}>
                                        * 귀하는 개인정보 수집 및 이용에 동의를 거부할 권리가 있으며, 거부 시 회원가입이 제한될 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.policyInfo}>
                                전체 상세 내용은 <Link href="/privacy" className={styles.policyLink}>개인정보처리방침</Link>에서 확인하실 수 있습니다.
                            </div>
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
                        src={getCdnUrl('/images/check.png')}
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
