'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { useUserNotifications, useMarkNotificationAsRead, useDeleteUserNotification } from '../hooks/useNotification';
import { UserNotificationResponse } from '@/types/notificationTypes';
import { getCdnUrl } from '@/lib/cdn';
import CircularProgress from '@mui/material/CircularProgress';

const decodeHtmlEntities = (value: string): string => {
    if (!value) {
        return '';
    }
    if (typeof window === 'undefined') {
        return value;
    }
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
};

export default function NotificationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userNotificationNoFromUrl = searchParams.get('userNotificationNo');

    const { data: notifications, isLoading, error, refetch } = useUserNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteNotificationMutation = useDeleteUserNotification();

    const [isHydrated, setIsHydrated] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'read', 'unread'
    const [displayedNotifications, setDisplayedNotifications] = useState<UserNotificationResponse[]>([]);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (notifications) {
            let filtered = notifications;
            if (activeTab === 'read') {
                filtered = notifications.filter(n => n.isRead);
            } else if (activeTab === 'unread') {
                filtered = notifications.filter(n => !n.isRead);
            }
            setDisplayedNotifications(filtered);
        }
    }, [notifications, activeTab]);

    // URL 파라미터로 특정 알림이 지정된 경우, 해당 알림으로 스크롤 및 읽음 처리
    useEffect(() => {
        if (userNotificationNoFromUrl && notifications) {
            const targetId = parseInt(userNotificationNoFromUrl);
            const targetNotification = notifications.find(n => n.userNotificationNo === targetId);

            if (targetNotification && !targetNotification.isRead) {
                markAsReadMutation.mutate(targetId, {
                    onSuccess: () => {
                        refetch(); // 읽음 처리 후 목록 새로고침
                    }
                });
            }

            // 스크롤은 클라이언트 렌더링 후에 실행될 수 있도록 잠시 지연
            const timer = setTimeout(() => {
                const element = document.getElementById(`notification-${targetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userNotificationNoFromUrl, notifications, markAsReadMutation, refetch]);

    const handleNotificationClick = (notification: UserNotificationResponse) => {
        const { userNotificationNo, boardNo } = notification
        markAsReadMutation.mutate(userNotificationNo, {
            onSuccess: () => {
                refetch();
                if (boardNo) {
                    router.push(`/board/${boardNo}`)
                } else {
                    router.push('/notifications')
                }
            },
            onError: () => {
                if (boardNo) {
                    router.push(`/board/${boardNo}`)
                }
            },
        })
    };

    const handleMarkAsReadOnly = (notification: UserNotificationResponse) => {
        markAsReadMutation.mutate(notification.userNotificationNo, {
            onSuccess: () => {
                refetch()
            },
        })
    }

    const handleDeleteNotification = (userNotificationNo: number) => {
        if (window.confirm('이 알림을 삭제하시겠습니까?')) {
            deleteNotificationMutation.mutate(userNotificationNo, {
                onSuccess: () => {
                    alert('알림이 삭제되었습니다.');
                    refetch(); // 삭제 후 목록 새로고침
                },
                onError: (err) => {
                    alert(`알림 삭제 실패: ${err.message}`);
                }
            });
        }
    };

    if (!isHydrated || isLoading) {
        return (
            <div className={styles.loadingState}>
                <CircularProgress size={28} />
                <span className={styles.loadingText}>알림을 불러오는 중입니다...</span>
            </div>
        );
    }
    if (error) return <p className={styles.noNotifications}>알림을 불러오는데 실패했습니다: {error.message}</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>최근 알림</h1>
                {/* <button className={styles.settingsButton}>⚙️</button> */}
            </div>
            <div className={styles.tabNav}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    전체
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'read' ? styles.active : ''}`}
                    onClick={() => setActiveTab('read')}
                >
                    읽은 알림
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'unread' ? styles.active : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    읽지 않은 알림
                </button>
                {/* <button className={styles.markAllReadButton}>모두 읽기</button> */}
            </div>

            <div className={styles.notificationList}>
                {displayedNotifications.length === 0 ? (
                    <p className={styles.noNotifications}>표시할 알림이 없습니다.</p>
                ) : (
                    displayedNotifications.map((notification) => (
                        <div 
                            key={notification.userNotificationNo}
                            id={`notification-${notification.userNotificationNo}`}
                            className={`${styles.notificationItem} ${notification.isRead ? styles.read : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            {/* 알림 타입에 따른 아이콘 (필요시 추가) */}
                            <Image src={getCdnUrl('/images/bell.png')} alt="알림 아이콘" width={40} height={40} className={styles.notificationIcon} />
                            <div className={styles.notificationText}>
                                <h2 className={styles.notificationTitle}>{notification.title}</h2>
                                <div
                                    className={styles.notificationContent}
                                    dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(notification.content) }}
                                />
                                <div className={styles.notificationFooterContent}> {/* 이 div로 타임스탬프와 액션 버튼을 감쌉니다. */}
                                    <span className={styles.notificationTimestamp}>{new Date(notification.createdDate).toLocaleString()}</span>
                                    <div className={styles.notificationActions}> {/* notificationActions를 이 위치로 이동 */}
                                        {!notification.isRead && (
                                            <button onClick={(e) => { e.stopPropagation(); handleMarkAsReadOnly(notification); }} className={styles.markAsReadButton}>
                                                읽음
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.userNotificationNo); }} className={styles.deleteButton}>
                                            <Image src={getCdnUrl('/images/delete.png')} alt="삭제" width={20} height={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
