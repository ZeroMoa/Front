import Image from 'next/image'
import Link from 'next/link'
import styles from './MainHeader.module.css'
import { useAppDispatch } from '../app/store/store';
import { resetState } from '../app/store/productSlice';
import { openLoginModal, logout } from '../app/store/authSlice'; // openLoginModal 액션 import, logout 액션 import
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../app/store/store'; // useAppSelector 임포트
import { selectIsLoggedIn } from '../app/store/authSlice'; // isLoggedIn 셀렉터 임포트
import { useState, useRef, useEffect } from 'react'; // useState, useRef, useEffect 임포트
import Cookies from 'js-cookie'; // Cookies 임포트

export default function Header() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isLoggedIn = useAppSelector(selectIsLoggedIn); // Redux 스토어에서 로그인 상태 가져오기
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // 알림 모달 상태 (이제 사용하지 않음)
    const [isProfileTooltipOpen, setIsProfileTooltipOpen] = useState(false); // 프로필 툴팁 상태
    const [isNotificationTooltipOpen, setIsNotificationTooltipOpen] = useState(false); // 알림 툴팁 상태

    // 툴팁 외부 클릭 감지를 위한 ref
    const profileTooltipRef = useRef<HTMLDivElement>(null);
    const notificationTooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileTooltipRef.current && !profileTooltipRef.current.contains(event.target as Node) &&
                notificationTooltipRef.current && !notificationTooltipRef.current.contains(event.target as Node)
            ) {
                setIsProfileTooltipOpen(false);
                setIsNotificationTooltipOpen(false);
            }
            // 단일 툴팁만 닫는 로직: 한 툴팁이 열려있고, 그 툴팁 밖을 클릭했는데 다른 툴팁은 클릭하지 않았을 경우
            if (isProfileTooltipOpen && profileTooltipRef.current && !profileTooltipRef.current.contains(event.target as Node)) {
                setIsProfileTooltipOpen(false);
            }
            if (isNotificationTooltipOpen && notificationTooltipRef.current && !notificationTooltipRef.current.contains(event.target as Node)) {
                setIsNotificationTooltipOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileTooltipOpen, isNotificationTooltipOpen]);

    // 알림 툴팁에서 사용할 임시 알림 데이터 (NotificationModal에서 가져옴)
    const dummyNotifications = [
        {
            id: 1,
            type: 'order',
            message: '주문하신 상품이 배송을 시작했습니다.',
            isRead: false,
            timestamp: '2025-10-20T10:00:00Z',
            imageUrl: '/images/delivery.png'
        },
        {
            id: 2,
            type: 'event',
            message: '새로운 이벤트가 시작되었습니다! 지금 확인하세요.',
            isRead: true,
            timestamp: '2025-10-19T14:30:00Z',
            imageUrl: '/images/event.png'
        },
        {
            id: 3,
            type: 'new_item',
            message: '새로운 상품이 등록되었습니다: 고구마 스틱.',
            isRead: false,
            timestamp: '2025-10-18T09:15:00Z',
            imageUrl: '/images/new_item.png'
        },
        {
            id: 4,
            type: 'order',
            message: '주문하신 상품이 성공적으로 배송 완료되었습니다.',
            isRead: true,
            timestamp: '2025-10-17T18:00:00Z',
            imageUrl: '/images/delivery.png'
        },
        {
            id: 5,
            type: 'event',
            message: '할인쿠폰이 발급되었습니다! 마이페이지에서 확인하세요.',
            isRead: false,
            timestamp: '2025-10-16T11:00:00Z',
            imageUrl: '/images/coupon.png'
        },
    ];

    const handleNavigation = (path: string) => {
        dispatch(resetState()); // 상태 초기화
        router.push(path); // 페이지 이동
    };

    const handleLoginClick = () => {
        dispatch(openLoginModal()); // 로그인 모달 열기
    };

    const handleJoinPageClick = () => {
        router.push('/login/join'); // 회원가입 페이지 경로
    };

    const handleProfileIconClick = () => {
        setIsProfileTooltipOpen(prev => !prev);
        setIsNotificationTooltipOpen(false); // 다른 툴팁 닫기
    };

    const handleNotificationIconClick = () => {
        setIsNotificationTooltipOpen(prev => !prev);
        setIsProfileTooltipOpen(false); // 다른 툴팁 닫기
    };

    const handleProfileClick = () => {
        setIsProfileTooltipOpen(false); // 내 정보 확인 클릭 시 툴팁 닫기
        router.push('/mypage/profile'); // 프로필 페이지 경로
    };

    const handleNotificationClick = () => {
        setIsNotificationTooltipOpen(false); // 전체 알림 보기 클릭 시 툴팁 닫기
        router.push('/notifications'); // 전체 알림 페이지로 이동
    };

    const handleFavoritesClick = () => {
        router.push('/favorites'); // 좋아요 상품 페이지 경로
    };

    const handleLogoutClick = async () => {
        try {
            const xsrfToken = Cookies.get('XSRF-TOKEN');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
                },
                credentials: 'include',
            });

            if (response.ok) {
                console.log('로그아웃 성공');
            } else {
                const errorData = await response.json();
                console.error('로그아웃 실패:', errorData.message || '알 수 없는 오류');
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        } finally {
            dispatch(logout());
            router.push('/');
            setIsProfileTooltipOpen(false); // 툴팁 닫기
        }
    };

    return (
        <header>
            <nav className={styles.wrap}>
                <div className={styles.navContainer}>
                    <div className={styles.logo}>
                        <Link href="/" onClick={() => dispatch(resetState())}>
                            <Image src="/images/logo.png" alt="제로모아" width={190} height={100} priority={true}/>
                        </Link>
                    </div>
                    <ul className={styles.nav_links}>
                        <li>
                            <button onClick={() => handleNavigation('/categories/drinks')} className={styles.linkButton}>
                                <Image src="/images/drinks.png" alt="음료" width={24} height={24} />음료
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleNavigation('/categories/snacks')} className={styles.linkButton}>
                                <Image src="/images/snack.png" alt="과자" width={24} height={24} />과자
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleNavigation('/categories/icecream')} className={styles.linkButton}>
                                <Image src="/images/icecream.png" alt="아이스크림" width={24} height={24} />아이스크림
                            </button>
                        </li>
                        {/* <li>
                            <button onClick={() => handleNavigation('/cafe')} className={styles.linkButton}>
                                <Image src="/images/cafe.png" alt="카페" width={24} height={24} />카페
                            </button>
                        </li> */}
                    </ul>
                    <div className={styles.authSection}>
                        {isLoggedIn ? (
                            <div className={styles.iconGroup}>
                                <div className={styles.profileButtonContainer}>
                                    <button onClick={handleProfileIconClick} className={styles.iconButton}>
                                        <Image src="/images/profile.png" alt="프로필" width={50} height={50} className={styles.headerIcon} />
                                    </button>
                                    {isProfileTooltipOpen && (
                                        <div ref={profileTooltipRef} className={styles.profileTooltip}> {/* ref 추가 */}
                                            <button onClick={handleProfileClick} className={styles.tooltipItem}>내 정보 확인</button>
                                            <button onClick={handleLogoutClick} className={`${styles.tooltipItem} ${styles.logoutItem}`}>로그아웃</button>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className={styles.notificationIconContainer}
                                    onClick={handleNotificationIconClick}
                                >
                                    <button className={styles.iconButton}>
                                        <Image src="/images/bell.png" alt="알림" width={30} height={30} className={styles.headerIcon} />
                                </button>
                                    {isNotificationTooltipOpen && (
                                        <div ref={notificationTooltipRef} className={styles.notificationTooltip}> {/* ref 추가 */}
                                            <div className={styles.notificationHeader}>
                                                <h3>알림</h3>
                                                <button onClick={(e) => { e.stopPropagation(); setIsNotificationTooltipOpen(false); }} className={styles.closeButton}>×</button>    
                                            </div>
                                            <div className={styles.notificationList}>
                                                {dummyNotifications.length > 0 ? (
                                                    dummyNotifications.map((notification) => (
                                                        <div key={notification.id} className={`${styles.notificationItem} ${notification.isRead ? styles.read : ''}`}>
                                                            {notification.imageUrl && (
                                                                <Image src={notification.imageUrl} alt="알림 아이콘" width={30} height={30} className={styles.notificationIcon} />
                                                            )}
                                                            <div className={styles.notificationText}>
                                                                <p className={styles.notificationMessage}>{notification.message}</p>
                                                                <span className={styles.notificationTimestamp}>{new Date(notification.timestamp).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className={styles.noNotifications}>새로운 알림이 없습니다.</p>
                                                )}
                                            </div>
                                            <div className={styles.notificationFooter}>
                                                <button onClick={handleNotificationClick} className={styles.viewAllButton}>
                                                    전체 알림 보기
                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleFavoritesClick} className={styles.iconButton}>
                                    <Image src="/images/favorite.png" alt="좋아요" width={30} height={30} className={styles.headerIcon} />
                                </button>
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
};