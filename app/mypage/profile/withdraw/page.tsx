"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Cookies from 'js-cookie'; // Cookies import 추가

interface WithdrawSurveyRequestDTO {
    password: string;
    reasonCodes: string[];
    reasonComment?: string;
}

interface UserWithdrawRequestDTO {
    password: string;
}

export default function WithdrawPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [reasonCodes, setReasonCodes] = useState<string[]>([]);
    const [reasonComment, setReasonComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        if (checked) {
            setReasonCodes(prev => [...prev, value]);
        } else {
            setReasonCodes(prev => prev.filter(reason => reason !== value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password) {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        if (reasonCodes.length === 0 && reasonComment.trim() === '') {
            setError('탈퇴 사유를 하나 이상 선택하거나 의견을 입력해주세요.');
            return;
        }

        const xsrfToken = Cookies.get('XSRF-TOKEN');

        try {
            // 1. 탈퇴 설문조사 API 호출 (POST /survey/withdraw)
            const surveyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/survey/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
                },
                credentials: 'include',
                body: JSON.stringify({
                    password: password, // 백엔드 DTO @NotBlank로 인해 필수
                    reasonCodes: reasonCodes,
                    reasonComment: reasonComment.trim() === '' ? undefined : reasonComment,
                } as WithdrawSurveyRequestDTO),
            });

            if (!surveyResponse.ok) {
                const contentType = surveyResponse.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await surveyResponse.json();
                    throw new Error(errorData.message || '탈퇴 설문조사 저장에 실패했습니다.');
                } else {
                    const errorText = await surveyResponse.text();
                    throw new Error(`탈퇴 설문조사 저장에 실패했습니다. (응답: ${surveyResponse.status} ${errorText})`);
                }
            }

            // 2. 회원 탈퇴 API 호출 (DELETE /user)
            const withdrawResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
                },
                credentials: 'include',
                body: JSON.stringify({ password } as UserWithdrawRequestDTO),
            });

            if (!withdrawResponse.ok) {
                const contentType = withdrawResponse.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await withdrawResponse.json();
                    // 403 Forbidden (비밀번호 불일치) 또는 다른 오류 메시지 처리
                    throw new Error(errorData.message || '회원 탈퇴에 실패했습니다.');
                } else {
                    const errorText = await withdrawResponse.text();
                    throw new Error(`회원 탈퇴에 실패했습니다. (응답: ${withdrawResponse.status} ${errorText})`);
                }
            }

            alert('회원 탈퇴가 성공적으로 처리되었습니다.');
            router.push('/'); // 탈퇴 후 홈으로 이동
        } catch (err: any) {
            console.error('회원 탈퇴 처리 중 오류 발생:', err);
            setError(`오류: ${err.message}`);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.withdrawContainer}>
                <div className={styles.headerSection}>
                    <h2 className={styles.pageTitle}>회원 탈퇴</h2>
                </div>
                <div className={styles.noticeSection}>
                    <div className={styles.noticeHeader}>
                        <label className={styles.noticeLabel}>회원탈퇴안내</label>
                    </div>
                    <div className={styles.noticeContentWrapper}>
                        <div className={styles.noticeContent}>
                            고객님께서 회원 탈퇴를 원하신다니 저희 서비스가 많이 부족하고 미흡했나 봅니다. 불편하셨던 점이나 불만사항을 알려주시면 적극 반영해서 고객님의 불편함을 해결해 드리도록 노력하겠습니다.
                            <strong className={styles.strongText}>아울러 회원 탈퇴 시 아래 사항을 숙지하시기 바랍니다.</strong>
                            <ul>
                                <li className={styles.listItem}>1. 회원 탈퇴 시 고객님의 정보는 서비스 약관 및 관련 법령에 의거하여 3개월동안 보관 후 파기됩니다.</li>
                                <li className={styles.listItem}>2. 탈퇴한 아이디는 재사용 및 복구가 불가능합니다.</li>
                                <li className={styles.listItem}>3. 회원 탈퇴 후 일정 기간(예: 3개월) 동안 재가입이 불가능합니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <div className={styles.labelWrapper}>
                            <label htmlFor="password" className={styles.label}>비밀번호 입력</label>
                        </div>
                        <div className={styles.inputFieldContainer}>
                            <div className={styles.passwordInputWrapper}>
                                <input
                                    data-testid="input-box"
                                    id="password"
                                    name="password"
                                    placeholder="현재 비밀번호를 입력해주세요"
                                    type="password"
                                    className={styles.inputField}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        {error && password === '' && <p className={styles.errorMessage}>{error}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelWrapper}>
                            <label className={styles.label}>무엇이 불편하였나요?</label>
                        </div>
                        <div className={styles.checkboxContainer}>
                            <div className={styles.checkboxWrapper}>
                                {[
                                    '고객서비스(상담,포장 등) 불만',
                                    '배송불만',
                                    '교환/환불/반품 불만',
                                    '방문 빈도가 낮음',
                                    '상품가격 불만',
                                    '개인 정보유출 우려',
                                    '쇼핑몰의 신뢰도 불만',
                                    '쇼핑 기능 불만'
                                ].map((reason, index) => (
                                    <label key={index} className={styles.checkboxLabel}>
                                        <input
                                            name="reasonCodes"
                                            type="checkbox"
                                            value={reason}
                                            className={styles.checkboxInput}
                                            onChange={handleCheckboxChange}
                                        />
                                        <div className={styles.checkboxSvg}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5C18.3513 0.5 23.5 5.64873 23.5 12Z" stroke="#ddd" fill="#fff"></path>
                                                <path d="M7 12.6667L10.3846 16L18 8.5" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                            </svg>
                                        </div>
                                        <span>{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={styles.commentContainer}>
                            <div className={styles.textareaWrapper}>
                                <textarea
                                    id="reasonComment"
                                    placeholder="고객님의 진심어린 충고 부탁드립니다."
                                    inputMode="text"
                                    aria-label="textarea-message"
                                    name="reasonComment"
                                    className={styles.commentTextarea}
                                    value={reasonComment}
                                    onChange={(e) => setReasonComment(e.target.value)}
                                ></textarea>
                                <div className={styles.placeholder}></div>
                                <span className={styles.contentLengthCounter}>{reasonComment.length}</span>
                            </div>
                        </div>
                        {error && reasonCodes.length === 0 && reasonComment.trim() === '' && <p className={styles.errorMessage}>{error}</p>}
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="button" className={`${styles.bottomButton} ${styles.cancelButton}`} onClick={() => router.back()}>
                            <span className={styles.buttonText}>취소</span>
                        </button>
                        <button type="submit" className={`${styles.bottomButton} ${styles.withdrawButton}`}>
                            <span className={styles.buttonText}>탈퇴</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
