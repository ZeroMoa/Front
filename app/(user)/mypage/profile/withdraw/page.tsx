"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { submitWithdrawSurvey, withdrawUser } from '../../../store/api/userAuthApi';
import { useAppDispatch } from '../../../store/slices/store';
import { logout } from '../../../store/slices/authSlice';
import { useQueryClient } from '@tanstack/react-query';
import CircularProgress from '@mui/material/CircularProgress';

const REASON_ORDER = [
    '정보가 적음',
    '정보가 정확하지 않음',
    '사이트의 기능이 적음',
    '방문 빈도가 낮음',
] as const;

const sortReasons = (reasons: string[]) =>
    REASON_ORDER.filter((reason) => reasons.includes(reason as string));


export default function WithdrawPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const [password, setPassword] = useState('');
    const [reasonCodes, setReasonCodes] = useState<string[]>([]);
    const [reasonComment, setReasonComment] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setReasonCodes((prev) => {
            if (checked) {
                const next = prev.includes(value) ? prev : [...prev, value];
                return sortReasons(next);
            }
            const filtered = prev.filter((reason) => reason !== value);
            return sortReasons(filtered);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setFormError(null);

        if (!password) {
            setPasswordError('비밀번호를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            await withdrawUser({ password });

            await submitWithdrawSurvey({
                password,
                reasonCodes: reasonCodes.length > 0 ? reasonCodes : undefined,
                reasonComment: reasonComment.trim() === '' ? undefined : reasonComment,
            });

            dispatch(logout());
            queryClient.removeQueries({ queryKey: ['user'], exact: true });

            alert('회원 탈퇴가 성공적으로 처리되었습니다.');
            router.push('/');
        } catch (err: unknown) {
            console.error('회원 탈퇴 처리 중 오류 발생:', err);
            const message = err instanceof Error ? err.message : '회원 탈퇴 처리 중 오류가 발생했습니다.';

            if (message.includes('비밀번호')) {
                setPasswordError('비밀번호를 잘못 입력하셨습니다.');
            } else if (message.includes('접근 권한이 없습니다')) {
                setFormError('회원 탈퇴 권한이 없습니다. 관리자에게 문의하세요.');
            } else {
                setFormError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPasswordError = Boolean(passwordError);

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
                                    className={`${styles.inputField} ${isPasswordError ? styles.inputError : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelWrapper}>
                            <label className={styles.label}>무엇이 불편하였나요?</label>
                        </div>
                        <div className={styles.checkboxContainer}>
                            <div className={styles.checkboxWrapper}>
                                {REASON_ORDER.map((reason) => (
                                    <label key={reason} className={styles.checkboxLabel}>
                                        <input
                                            name="reasonCodes"
                                            type="checkbox"
                                            value={reason}
                                            className={styles.checkboxInput}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span>{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={styles.commentContainer}>
                            <div className={styles.textareaWrapper}>
                                <textarea
                                    id="reasonComment"
                                    placeholder="회원님의 진심어린 충고 부탁드립니다."
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
                    </div>

                    {formError && (
                        <p className={styles.errorMessage}>{formError}</p>
                    )}

            <div className={styles.buttonGroup}>
                        <button type="button" className={`${styles.bottomButton} ${styles.cancelButton}`} onClick={() => router.back()}>
                            <span className={styles.buttonText}>취소</span>
                        </button>
                        <button type="submit" className={`${styles.bottomButton} ${styles.withdrawButton}`} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className={styles.buttonLoading}>
                                    <CircularProgress size={18} />
                                    <span className={styles.buttonLoadingText}>탈퇴 진행 중...</span>
                                </span>
                            ) : (
                                <span className={styles.buttonText}>탈퇴</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
