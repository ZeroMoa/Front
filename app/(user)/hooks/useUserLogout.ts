'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { suppressSessionExpiryAlert, suppressSessionExpiryRedirect } from '@/lib/common/api/fetchWithAuth';
import { useAppDispatch } from '../store/slices/store';
import { logout } from '../store/slices/authSlice';

const FAVORITE_MAP_STORAGE_KEY = 'favorite:map';

interface LogoutOptions {
    forceRedirectTo?: string;
    protectedPrefixes?: string[];
}

const DEFAULT_PROTECTED_PREFIXES = ['/mypage/profile', '/notifications', '/favorites'];

export function useUserLogout() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const logoutUser = useCallback(
        async (options?: LogoutOptions) => {
            const protectedPrefixes = options?.protectedPrefixes ?? DEFAULT_PROTECTED_PREFIXES;
            suppressSessionExpiryRedirect(5000);
            try {
                const xsrfToken = Cookies.get('XSRF-TOKEN');
                const refreshToken = Cookies.get('refreshToken') || '';
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken, 'X-CSRF-TOKEN': xsrfToken }),
                    },
                    body: JSON.stringify({ refreshToken }),
                    credentials: 'include',
                });

                if (response.ok) {
                    console.log('로그아웃 성공');
                    alert('로그아웃 되었습니다.');
                    suppressSessionExpiryAlert(4000);
                } else {
                    let errorData: { message?: string } = {};
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData.message = '로그아웃 실패: 서버 응답 오류';
                    }
                    const errorMessage = errorData.message || `로그아웃 실패: ${response.status}`;

                    if (
                        response.status === 401 &&
                        (errorMessage.includes('액세스 토큰이 없습니다. 로그인해주세요.') ||
                            errorMessage.includes('액세스 토큰이 만료되었습니다. 다시 로그인해주세요.'))
                    ) {
                        alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
                    } else {
                        console.error('로그아웃 실패:', errorMessage);
                        alert(`로그아웃 실패: ${errorMessage}`);
                    }
                }
            } catch (error) {
                console.error('로그아웃 중 오류 발생:', error);
                alert(`로그아웃 처리 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            } finally {
                dispatch(logout());
                await queryClient.cancelQueries({ queryKey: ['userNotifications'] });
                await queryClient.cancelQueries({ queryKey: ['userNotification'] });
                queryClient.removeQueries({ queryKey: ['user'], exact: true });
                queryClient.removeQueries({ queryKey: ['userNotifications'] });
                queryClient.removeQueries({ queryKey: ['userNotification'] });
                queryClient.setQueryData(['user'], undefined);
                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem(FAVORITE_MAP_STORAGE_KEY);
                    window.dispatchEvent(
                        new CustomEvent('favorite-updated', {
                            detail: { resetAllFavorites: true },
                        }),
                    );
                }
                const requiresAuth = protectedPrefixes.some(
                    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
                );

                if (options?.forceRedirectTo) {
                    suppressSessionExpiryRedirect(3000);
                    router.replace(options.forceRedirectTo);
                } else if (requiresAuth) {
                    suppressSessionExpiryRedirect(3000);
                    router.replace('/');
                }
            }
        },
        [dispatch, pathname, queryClient, router],
    );

    return logoutUser;
}

