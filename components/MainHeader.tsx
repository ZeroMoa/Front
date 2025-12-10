'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from './MainHeader.module.css'
import { useAppDispatch, useAppSelector } from '../app/(user)/store/slices/store';
import { resetState } from '../app/(user)/store/slices/productSlice';
import { openLoginModal, logout, selectIsLoggedIn } from '../app/(user)/store/slices/authSlice';
import { getUserData } from '../app/(user)/store/api/userAuthApi';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useId } from 'react'; // useState, useRef, useEffect 임포트
import Cookies from 'js-cookie'; // Cookies 임포트
import { useIsLoggedIn } from '../app/(user)/hooks/useAuth'; // React Query hook import
import { useUserNotifications, useMarkNotificationAsRead, useDeleteUserNotification, useMarkAllNotificationsAsRead } from '../app/(user)/hooks/useNotification'; // 알림 훅 import
import type { CategorySlug } from '../app/(user)/product/config';
import { getCdnUrl } from '../lib/cdn';
import { suppressSessionExpiryAlert } from '../lib/common/api/fetchWithAuth';
import type { UserNotificationResponse } from '@/types/notificationTypes'
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_NAV_ITEMS: Array<{
    slug: CategorySlug;
    label: string;
    icon: string;
}> = [
    { slug: 'drinks', label: '음료', icon: '/images/drinks.png' },
    { slug: 'snacks', label: '과자', icon: '/images/snack.png' },
    { slug: 'icecream', label: '아이스크림', icon: '/images/icecream.png' },
];

export default function Header() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    
    const { isLoading: authLoading } = useIsLoggedIn();
    const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useUserNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteNotificationMutation = useDeleteUserNotification();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead(); // 모든 알림 읽음 처리 훅

    const [isHydrated, setIsHydrated] = useState(false);
    const isLoggedIn = useAppSelector(selectIsLoggedIn); // Redux의 isLoggedIn 상태 사용
    const profileTooltipId = useId();
    const notificationTooltipId = useId();
    
    const [isProfileTooltipOpen, setIsProfileTooltipOpen] = useState(false); // 프로필 툴팁 상태
    const [isNotificationTooltipOpen, setIsNotificationTooltipOpen] = useState(false); // 알림 툴팁 상태

    // 툴팁 외부 클릭 감지를 위한 ref
    const profileTooltipRef = useRef<HTMLDivElement>(null);
    const notificationTooltipRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLButtonElement>(null);
    const notificationButtonRef = useRef<HTMLButtonElement>(null);

    // hydration 완료 감지
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (profileTooltipRef.current && profileTooltipRef.current.contains(target)) {
                return;
            }
            if (notificationTooltipRef.current && notificationTooltipRef.current.contains(target)) {
                return;
            }
            if (profileButtonRef.current && profileButtonRef.current.contains(target)) {
                return;
            }
            if (notificationButtonRef.current && notificationButtonRef.current.contains(target)) {
                return;
            }
            setIsProfileTooltipOpen(false);
            setIsNotificationTooltipOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileTooltipOpen, isNotificationTooltipOpen]);

    const handleCategoryNavigation = (slug: CategorySlug) => {
        dispatch(resetState());
        router.push(`/product?type=${slug}`);
    };

    const handleLoginClick = () => {
        dispatch(openLoginModal()); // 로그인 모달 열기
    };

    const handleJoinPageClick = () => {
        router.push('/login/join'); // 회원가입 페이지 경로
    };

    const handleProfileClick = () => {
        setIsProfileTooltipOpen(false); // 내 정보 확인 클릭 시 툴팁 닫기
        router.push('/mypage/profile'); // 프로필 페이지 경로
    };

    const handleProfileIconClick = () => {
        setIsProfileTooltipOpen(prev => !prev);
        setIsNotificationTooltipOpen(false); // 다른 툴팁 닫기
    };

    const handleNotificationIconClick = () => {
        if (!isLoggedIn) {
            alert('로그인 후 이용해주세요~.~');
            dispatch(openLoginModal());
            return;
        }

        const hasUnread = notifications?.some((notification) => !notification.isRead);
        setIsNotificationTooltipOpen((prev) => {
            const next = !prev;
            if (next) {
                void refetchNotifications();
                if (hasUnread) {
                    markAllAsReadMutation.mutate();
                }
            }
            return next;
        });
        setIsProfileTooltipOpen(false); // 다른 툴팁 닫기
    };

    const handleNotificationItemClick = (notification: UserNotificationResponse) => {
        const { userNotificationNo, boardNo } = notification
        markAsReadMutation.mutate(userNotificationNo, {
            onSuccess: () => {
                setIsNotificationTooltipOpen(false)
                if (boardNo) {
                    router.push(`/board/${boardNo}`)
                } else {
                    router.push('/notifications')
                }
                refetchNotifications()
            },
            onError: () => {
                setIsNotificationTooltipOpen(false)
                if (boardNo) {
                    router.push(`/board/${boardNo}`)
                }
            },
        })
    };

    const handleNotificationMarkReadOnly = (event: React.MouseEvent<HTMLButtonElement>, notification: UserNotificationResponse) => {
        event.stopPropagation()
        markAsReadMutation.mutate(notification.userNotificationNo, {
            onSuccess: () => {
                refetchNotifications()
            },
        })
    }

    const handleNotificationDelete = (event: React.MouseEvent<HTMLButtonElement>, notification: UserNotificationResponse) => {
        event.stopPropagation()
        deleteNotificationMutation.mutate(notification.userNotificationNo, {
            onSuccess: () => {
                refetchNotifications()
            },
        })
    }

    const handleNotificationClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setIsNotificationTooltipOpen(false); // 전체 알림 보기 클릭 시 툴팁 닫기
        router.push('/notifications'); // 전체 알림 페이지로 이동
    };

    const handleFavoritesClick = () => {
        if (!isLoggedIn) {
            alert('로그인 후 이용해주세요~.~');
            return;
        }
        router.push('/favorites'); // 좋아요 상품 페이지 경로
    };

    const handleLogoutClick = async () => {
        const protectedPrefixes = ['/mypage/profile', '/notifications', '/favorites'];
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
                alert('로그아웃 되었습니다.'); // 로그아웃 성공 메시지
                suppressSessionExpiryAlert(4000);
            } else {
                let errorData: { message?: string } = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData.message = '로그아웃 실패: 서버 응답 오류';
                }
                const errorMessage = errorData.message || `로그아웃 실패: ${response.status}`;

                if (response.status === 401 && (errorMessage.includes('액세스 토큰이 없습니다. 로그인해주세요.') || errorMessage.includes('액세스 토큰이 만료되었습니다. 다시 로그인해주세요.'))) {
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
            dispatch(logout()); // Redux 상태에서 로그아웃 처리
            await queryClient.cancelQueries({ queryKey: ['userNotifications'] });
            await queryClient.cancelQueries({ queryKey: ['userNotification'] });
            queryClient.removeQueries({ queryKey: ['user'], exact: true });
            queryClient.removeQueries({ queryKey: ['userNotifications'] });
            queryClient.removeQueries({ queryKey: ['userNotification'] });
            try {
                await getUserData();
            } catch {
                // logout 후 인증 API에 access/refresh 쿠키가 없는지 확인하기 위한 호출, 실패해도 무시
            }
            setIsProfileTooltipOpen(false); // 툴팁 닫기
            const requiresAuth = protectedPrefixes.some(
                (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
            );
            if (requiresAuth) {
                router.replace('/');
            }
        }
    };

    return (
        <header>
            <nav className={styles.wrap}>
                <div className={styles.navContainer}>
                    <div className={styles.logo}>
                        <Link href="/" onClick={() => dispatch(resetState())}>
                            <Image src={getCdnUrl('/images/logo.png')} alt="제로모아" width={190} height={90} priority={true}/>
                        </Link>
                    </div>
                    <ul className={styles.nav_links}>
                        {CATEGORY_NAV_ITEMS.map((item) => (
                            <li key={item.slug}>
                                <button
                                    onClick={() => handleCategoryNavigation(item.slug)}
                                    className={styles.linkButton}
                                >
                                    <Image src={getCdnUrl(item.icon)} alt={item.label} width={24} height={24} />
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.authSection}>
                        {!isHydrated || authLoading ? (
                            // 로딩 중일 때는 빈 공간 유지 (깜빡임 방지)
                            <div style={{ width: '200px', height: '50px' }}></div>
                        ) : isLoggedIn ? (
                            <div className={styles.iconGroup}>
                                <div className={styles.iconWithLabel}>
                                    <div className={styles.profileButtonContainer}>
                                        <button
                                            type="button"
                                            onClick={handleProfileIconClick}
                                            className={styles.iconButton}
                                            aria-haspopup="menu"
                                            aria-expanded={isProfileTooltipOpen}
                                            aria-controls={isProfileTooltipOpen ? profileTooltipId : undefined}
                                            ref={profileButtonRef}
                                        >
                                            <Image src={getCdnUrl('/images/profile.png')} alt="프로필" width={50} height={50} className={styles.headerIcon} />
                                        </button>
                                        {isProfileTooltipOpen && (
                                            <div ref={profileTooltipRef} className={styles.profileTooltip} id={profileTooltipId}>
                                                <button onClick={handleProfileClick} className={styles.tooltipItem}>내 정보 확인</button>
                                                <button onClick={handleLogoutClick} className={`${styles.tooltipItem} ${styles.logoutItem}`}>로그아웃</button>
                                            </div>
                                        )}
                                    </div>
                                    <span className={styles.iconLabel}>프로필</span>
                                </div>

                                <div className={`${styles.notificationIconContainer} ${styles.iconWithLabel}`}>
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        ref={notificationButtonRef}
                                        onClick={handleNotificationIconClick}
                                        aria-haspopup="dialog"
                                        aria-expanded={isNotificationTooltipOpen}
                                        aria-controls={isNotificationTooltipOpen ? notificationTooltipId : undefined}
                                    >
                                        <Image
                                            src={getCdnUrl(notifications?.some(n => !n.isRead) ? '/images/bell4.png' : '/images/bell.png')}
                                            alt="알림" width={30} height={30} className={styles.headerIcon}
                                        />
                                        {/* {!unreadCountLoading && unreadCount && unreadCount > 0 && (
                                            <span className={styles.unreadBadge}>{unreadCount}</span>
                                        )} */}
                                </button>
                                    {isNotificationTooltipOpen && (
                                        <div ref={notificationTooltipRef} className={styles.notificationTooltip} id={notificationTooltipId}>
                                            <div className={styles.notificationHeader}>
                                                <h3>알림</h3>
                                                {/* <button onClick={handleMarkAllAsRead} className={styles.markAllReadButton}>모두 읽기</button> */}
                                                <button onClick={(e) => { e.stopPropagation(); setIsNotificationTooltipOpen(false); }} className={styles.closeButton}>×</button>    
                                            </div>
                                            <div className={styles.notificationList}>
                                                {notificationsLoading ? (
                                                    <p className={styles.loadingNotifications}>알림을 불러오는 중...</p>
                                                ) : notifications?.length === 0 ? (
                                                    <p className={styles.noNotifications}>새로운 알림이 없습니다.</p>
                                                ) : (
                                                    notifications?.map((notification) => (
                                                        <div 
                                                            key={notification.userNotificationNo} 
                                                            className={`${styles.notificationItem} ${notification.isRead ? styles.read : ''}`}
                                                            onClick={() => handleNotificationItemClick(notification)}
                                                        >
                                                            {/* 알림 타입에 따른 아이콘 (필요시 추가, 현재는 기본 종 모양) */}
                                                            <Image src={getCdnUrl('/images/bell.png')} alt="알림 아이콘" width={30} height={30} className={styles.notificationIcon} />
                                                            <div className={styles.notificationText}>
                                                                <p className={styles.notificationMessage}>{notification.title}</p>
                                                                <div className={styles.notificationFooterContent}>
                                                                    <span className={styles.notificationTimestamp}>{new Date(notification.createdDate).toLocaleString()}</span>
                                                                    <div className={styles.notificationActions}>
                                                                        {!notification.isRead && (
                                                                            <button
                                                                                type="button"
                                                                                className={styles.markAsReadButton}
                                                                                onClick={(e) => handleNotificationMarkReadOnly(e, notification)}
                                                                            >
                                                                                읽음
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            className={styles.deleteButton}
                                                                            onClick={(e) => handleNotificationDelete(e, notification)}
                                                                        >
                                                                            <Image src={getCdnUrl('/images/delete.png')} alt="삭제" width={20} height={20} className={styles.deleteIcon} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className={styles.notificationFooter} onClick={(e) => e.stopPropagation()}> {/* 이벤트 버블링 방지 */}
                                                <button onClick={handleNotificationClick} className={styles.viewAllButton}>
                                                    전체 알림 보기
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <span className={styles.iconLabel}>알림</span>
                                </div>

                                <div className={styles.iconWithLabel}>
                                    <button type="button" onClick={handleFavoritesClick} className={styles.iconButton} aria-label="좋아요한 상품">
                                        <Image src={getCdnUrl('/images/favorite2.png')} alt="좋아요" width={30} height={30} className={styles.headerIcon} />
                                    </button>
                                    <span className={styles.iconLabel}>좋아요</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.authLinks}>
                                <button onClick={handleLoginClick} className={styles.authLinkButton}>로그인</button>
                                <span className={styles.authSeparator}>|</span>
                                <button onClick={handleJoinPageClick} className={styles.authLinkButton}>회원가입</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}